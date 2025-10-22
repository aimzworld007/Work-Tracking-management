import React from 'react';
import { WorkItem } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, DeleteIcon } from './icons';

interface WorkItemRowProps {
  item: WorkItem;
  index: number;
  onEdit: (item: WorkItem) => void;
  onDelete: (id: number) => void;
}

const WorkItemRow: React.FC<WorkItemRowProps> = ({ item, index, onEdit, onDelete }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
  };
  
  return (
    <tr className="bg-white border-b hover:bg-slate-50 even:bg-slate-50 transition-colors duration-200">
      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{index}</td>
      <td className="px-6 py-4">{formatDate(item.dateOfWork)}</td>
      <td className="px-6 py-4">{item.workBy}</td>
      <td className="px-6 py-4">{item.workOfType}</td>
      <td className="px-6 py-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-6 py-4 font-medium">{item.customerName}</td>
      <td className="px-6 py-4 text-slate-500">{item.trackingNumber}</td>
      <td className="px-6 py-4 text-slate-500">{item.customerNumber}</td>
      <td className="px-6 py-4 font-bold text-center">{item.dayCount}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center space-x-2">
          <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-100">
            <EditIcon />
          </button>
          <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-100">
            <DeleteIcon />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default WorkItemRow;