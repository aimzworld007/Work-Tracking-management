import React from 'react';
import { AddIcon } from './icons';

interface FabProps {
  onClick: () => void;
  isVisible: boolean;
}

const Fab: React.FC<FabProps> = ({ onClick, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 inline-flex items-center justify-center w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110"
      aria-label="Add new work item"
      title="Add New"
    >
      <AddIcon className="h-7 w-7" />
    </button>
  );
};

export default Fab;