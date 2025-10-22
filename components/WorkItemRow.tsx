import React from 'react';
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
  if (!workType) return 'border-l-slate-200';
  const hash = stringToHash(workType);
  return COLORS[hash % COLORS.length];
};


const WorkItemRow: React.FC<WorkItemRowProps> = ({ item, serialNumber, onEdit, onDelete, onArchive, onUnarchive }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
  const colorClass = getWorkTypeColorClass(item.workOfType);

  return (
    <tr className={`even:bg-slate-50/50 hover:bg-indigo-50/20 transition-colors duration-150 border-l-4 ${colorClass}`}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-center font-medium text-slate-600 sm:pl-6">{serialNumber}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">{formatDate(item.dateOfWork)}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">{item.workBy}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">{item.workOfType}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-3 py-4 text-sm text-slate-600">
        <div className="font-medium text-slate-900">{item.customerName}</div>
        {(item.passportNumber || item.mobileWhatsappNumber) && (
            <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                {item.passportNumber && (
                    <div>
                        <span className="font-semibold text-slate-600">P:</span> {item.passportNumber}
                    </div>
                )}
                {item.mobileWhatsappNumber && (
                    <div>
                        <span className="font-semibold text-slate-600">M/W:</span> {item.mobileWhatsappNumber}
                    </div>
                )}
            </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
        {item.trackingNumber}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-center font-semibold text-slate-700">{item.dayCount}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex justify-end items-center gap-1">
            {!item.isArchived ? (
              <>
                <button onClick={onEdit} className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-md transition-colors" title="Edit">
                    <EditIcon className="h-4 w-4" />
                </button>
                <button onClick={onDelete} className="text-slate-500 hover:text-red-600 p-1.5 rounded-md transition-colors" title="Delete">
                    <DeleteIcon className="h-4 w-4" />
                </button>
                {item.status === 'Approved' && (
                     <button onClick={onArchive} className="text-slate-500 hover:text-green-600 p-1.5 rounded-md transition-colors" title="Archive">
                        <ArchiveIcon className="h-4 w-4" />
                    </button>
                )}
              </>
            ) : (
                <button onClick={onUnarchive} className="text-slate-500 hover:text-yellow-600 p-1.5 rounded-md transition-colors" title="Unarchive">
                    <UnarchiveIcon className="h-4 w-4" />
                </button>
            )}
        </div>
      </td>
    </tr>
  );
};

export default WorkItemRow;