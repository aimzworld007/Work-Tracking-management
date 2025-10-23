import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, DeleteIcon, ArchiveIcon, UnarchiveIcon, ExternalLinkIcon } from './icons';

interface WorkItemRowProps {
  item: WorkItem;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => Promise<void>;
  onUnarchive: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  statusOptions: string[];
  isEditMode: boolean;
}

const COLORS = [
  'border-l-pink-400',
  'border-l-indigo-400',
  'border-l-amber-400',
  'border-l-teal-400',
  'border-l-cyan-400',
  'border-l-lime-400',
  'border-l-purple-400',
  'border-l-sky-400',
  'border-l-rose-400',
  'border-l-emerald-400',
];

const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return Math.abs(hash);
};

const getWorkTypeColorClass = (workType: string): string => {
  if (!workType) return 'border-l-slate-200 dark:border-l-slate-700';
  const hash = stringToHash(workType);
  return COLORS[hash % COLORS.length];
};

const getTrackingLink = (workType: string): string | null => {
  const dubaiPoliceTypes = ['Lost PP Certificate', 'Police Clearance'];
  const mohreTypes = ['withdraw absconding', 'work permit', 'labor cancel', 'Mohare est update'];

  if (dubaiPoliceTypes.includes(workType)) {
    return 'https://www.dubaipolice.gov.ae/wps/portal/home/hidden/verifyidentity';
  }

  if (mohreTypes.includes(workType)) {
    return 'https://inquiry.mohre.gov.ae';
  }

  return null;
};


const WorkItemRow: React.FC<WorkItemRowProps> = ({ item, isSelected, onToggleSelection, onEdit, onDelete, onArchive, onUnarchive, onStatusChange, statusOptions, isEditMode }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

  useEffect(() => {
    // When the canonical status from props changes, it means our optimistic update
    // has been confirmed and persisted. We can clear the optimistic state.
    setOptimisticStatus(null);
  }, [item.status]);
  
  const displayStatus = optimisticStatus || item.status;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(`${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
  const colorClass = getWorkTypeColorClass(item.workOfType);
  
  const handleStatusUpdate = async (newStatus: string) => {
    setIsEditingStatus(false);
    if (newStatus === 'Archive') {
        if (window.confirm('Are you sure you want to archive this item?')) {
            setIsSaving(true);
            try {
                await onArchive();
            } finally {
                setIsSaving(false);
            }
        }
        return;
    }

    if (newStatus !== item.status) {
      setIsSaving(true);
      setOptimisticStatus(newStatus);
      try {
        await onStatusChange(item.id!, newStatus);
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Failed to update status. Reverting change.");
        setOptimisticStatus(null); // Revert on failure
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        onDelete();
    }
  };
  
  const handleArchiveClick = () => {
    if (window.confirm('Are you sure you want to archive this item?')) {
        onArchive();
    }
  };

  const handleUnarchiveClick = () => {
    if (window.confirm('Are you sure you want to unarchive this item?')) {
        onUnarchive();
    }
  };

  const trackingLink = getTrackingLink(item.workOfType);

  return (
    <tr 
        data-item-id={item.id}
        className={`${isSelected ? 'bg-indigo-50 dark:bg-slate-800/50' : 'even:bg-slate-50/50 dark:even:bg-slate-800/50'} hover:bg-indigo-50/20 dark:hover:bg-slate-800 transition-colors duration-150 border-l-4 ${colorClass}`}
    >
      <td className="relative px-7 sm:w-12 sm:px-6">
        <input
            type="checkbox"
            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-600 dark:checked:bg-indigo-500"
            checked={isSelected}
            onChange={() => onToggleSelection(item.id!)}
            aria-label={`Select item ${item.customerName}`}
        />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(item.dateOfWork)}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">{item.workBy}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">{item.workOfType}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
        {isEditingStatus ? (
          <select
            value={displayStatus}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            onBlur={() => setIsEditingStatus(false)}
            autoFocus
            className="block w-full max-w-[170px] rounded-md border-0 bg-white dark:bg-slate-900 py-1 pl-2 pr-7 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-xs sm:leading-5"
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {(item.status === 'Approved' || item.status === 'Rejected') && (
                <>
                    <option disabled>──────────</option>
                    <option value="Archive">Archive Item</option>
                </>
            )}
          </select>
        ) : (
          <button
            onClick={() => !isSaving && isEditMode && setIsEditingStatus(true)}
            disabled={isSaving || !isEditMode}
            className="group w-full flex items-center text-left rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed"
            title={isEditMode ? "Click to change status" : ""}
          >
            <StatusBadge status={displayStatus} />
            {isSaving && <span className="text-xs ml-2 animate-pulse text-slate-500 dark:text-slate-400">Saving...</span>}
          </button>
        )}
      </td>
      <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="font-medium text-slate-900 dark:text-slate-100">{item.customerName}</div>
        {(item.passportNumber || item.mobileWhatsappNumber) && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                {item.passportNumber && (
                    <div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">P:</span> {item.passportNumber}
                    </div>
                )}
                {item.mobileWhatsappNumber && (
                    <div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">M/W:</span> {item.mobileWhatsappNumber}
                    </div>
                )}
            </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
        {trackingLink && item.trackingNumber ? (
            <a
                href={trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-indigo-600 hover:underline dark:text-indigo-400"
                title="Open verification website in a new tab"
            >
                <span>{item.trackingNumber}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </a>
        ) : (
            item.trackingNumber
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-center font-semibold text-slate-700 dark:text-slate-300">{item.dayCount}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        {isEditMode && (
          <div className="flex justify-end items-center gap-1">
              {!item.isArchived ? (
                <>
                  <button onClick={onEdit} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md transition-colors" title="Edit">
                      <EditIcon className="h-4 w-4" />
                  </button>
                  <button onClick={handleDeleteClick} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-1.5 rounded-md transition-colors" title="Delete">
                      <DeleteIcon className="h-4 w-4" />
                  </button>
                  {(item.status === 'Approved' || item.status === 'Rejected') && (
                       <button onClick={handleArchiveClick} className="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 p-1.5 rounded-md transition-colors" title="Archive">
                          <ArchiveIcon className="h-4 w-4" />
                      </button>
                  )}
                </>
              ) : (
                  <>
                      <button onClick={handleUnarchiveClick} className="text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 p-1.5 rounded-md transition-colors" title="Unarchive">
                          <UnarchiveIcon className="h-4 w-4" />
                      </button>
                      <button onClick={handleDeleteClick} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-1.5 rounded-md transition-colors" title="Delete">
                          <DeleteIcon className="h-4 w-4" />
                      </button>
                  </>
              )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default WorkItemRow;