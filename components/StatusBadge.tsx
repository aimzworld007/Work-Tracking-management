import React from 'react';
import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
}

const COLORS = [
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-amber-100 text-amber-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-lime-100 text-lime-800',
];

const stringToHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'under processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waiting delivery':
        return 'bg-purple-100 text-purple-800';
      default:
        const hash = stringToHash(status);
        return COLORS[hash % COLORS.length];
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;