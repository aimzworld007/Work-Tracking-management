import React from 'react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
}

const COLORS = [
  'bg-pink-100 text-pink-700 ring-pink-600/20',
  'bg-indigo-100 text-indigo-700 ring-indigo-600/20',
  'bg-amber-100 text-amber-700 ring-amber-600/20',
  'bg-teal-100 text-teal-700 ring-teal-600/20',
  'bg-cyan-100 text-cyan-700 ring-cyan-600/20',
  'bg-lime-100 text-lime-700 ring-lime-600/20',
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

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'under processing':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'approved':
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'rejected':
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'waiting delivery':
        return 'bg-purple-100 text-purple-700 ring-purple-600/20';
      default:
        const hash = stringToHash(status);
        return COLORS[hash % COLORS.length];
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;