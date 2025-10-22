import React from 'react';
import { WorkItem } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, DeleteIcon, ArchiveIcon, UnarchiveIcon } from './icons';

interface WorkItemRowProps {
  item: WorkItem;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
}

const WorkItemRow: React.FC<WorkItemRowProps> = ({ item, onEdit, onDelete, onArchive, onUnarchive }) => {
  const formatDate = (dateStr: string) => {
    // Add T00:00:00 to ensure date is parsed in local timezone
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <tr className="bg-white border-b hover:bg-slate-50 transition-colors duration-150">
      <td className="px-6 py-4">{formatDate(item.dateOfWork)}</td>
      <td className="px-6 py-4">{item.workBy}</td>
      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.workOfType}</td>
      <td className="px-6 py-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-6 py-4">{item.customerName}</td>
      <td className="px-6 py-4">
        {item.trackingNumber && <div className="text-xs">T: {item.trackingNumber}</div>}
        {item.ppNumber && <div className="text-xs">PP: {item.ppNumber}</div>}
        {item.customerNumber && <div className="text-xs">C: {item.customerNumber}</div>}
      </td>
      <td className="px-6 py-4 text-center font-semibold">{item.dayCount}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end items-center gap-2">
            {!item.isArchived && (
              <>
                <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                    <EditIcon />
                </button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                    <DeleteIcon />
                </button>
              </>
            )}
            {item.status === 'Approved' && !item.isArchived && (
                 <button onClick={onArchive} className="text-green-600 hover:text-green-800 p-1" title="Archive">
                    <ArchiveIcon />
                </button>
            )}
            {item.isArchived && (
                <button onClick={onUnarchive} className="text-yellow-600 hover:text-yellow-800 p-1" title="Unarchive">
                    <UnarchiveIcon />
                </button>
            )}
        </div>
      </td>
    </tr>
  );
};

export default WorkItemRow;
