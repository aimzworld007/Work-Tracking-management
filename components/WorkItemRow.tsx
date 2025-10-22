import React, { useState } from 'react';
import { WorkItem } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, DeleteIcon, ArchiveIcon, UnarchiveIcon } from './icons';

interface WorkItemRowProps {
  item: WorkItem;
  serialNumber: number;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  statusOptions: string[];
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


const WorkItemRow: React.FC<WorkItemRowProps> = ({ item, serialNumber, onEdit, onDelete, onArchive, onUnarchive, onStatusChange, statusOptions }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
  const colorClass = getWorkTypeColorClass(item.workOfType);
  
  const handleStatusUpdate = async (newStatus: string) => {
    setIsEditingStatus(false);
    if (newStatus !== item.status) {
      setIsSaving(true);
      try {
        await onStatusChange(item.id!, newStatus);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <tr className={`even:bg-slate-50/50 dark:even:bg-slate-800/50 hover:bg-indigo-50/20 dark:hover:bg-slate-800 transition-colors duration-150 border-l-4 ${colorClass}`}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-center font-medium text-slate-600 dark:text-slate-400 sm:pl-6">{serialNumber}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(item.dateOfWork)}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">{item.workBy}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">{item.workOfType}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
        {isEditingStatus ? (
          <select
            value={item.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            onBlur={() => setIsEditingStatus(false)}
            autoFocus
            className="block w-full max-w-[170px] rounded-md border-0 bg-white dark:bg-slate-900 py-1 pl-2 pr-7 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-xs sm:leading-5"
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <button
            onClick={() => setIsEditingStatus(true)}
            disabled={isSaving}
            className="group w-full flex items-center text-left rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-wait"
            title="Click to change status"
          >
            <StatusBadge status={item.status} />
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
        {item.trackingNumber}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-center font-semibold text-slate-700 dark:text-slate-300">{item.dayCount}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex justify-end items-center gap-1">
            {!item.isArchived ? (
              <>
                <button onClick={onEdit} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md transition-colors" title="Edit">
                    <EditIcon className="h-4 w-4" />
                </button>
                <button onClick={onDelete} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-1.5 rounded-md transition-colors" title="Delete">
                    <DeleteIcon className="h-4 w-4" />
                </button>
                {item.status === 'Approved' && (
                     <button onClick={onArchive} className="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-500 p-1.5 rounded-md transition-colors" title="Archive">
                        <ArchiveIcon className="h-4 w-4" />
                    </button>
                )}
              </>
            ) : (
                <button onClick={onUnarchive} className="text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 p-1.5 rounded-md transition-colors" title="Unarchive">
                    <UnarchiveIcon className="h-4 w-4" />
                </button>
            )}
        </div>
      </td>
    </tr>
  );
};

export default WorkItemRow;