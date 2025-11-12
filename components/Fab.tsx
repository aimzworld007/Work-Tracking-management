import React, { useState } from 'react';
import { AddIcon, BellIcon, ClipboardDocumentCheckIcon } from './icons';

interface FabProps {
  onAddWorkItem: () => void;
  onAddReminder: () => void;
}

const Fab: React.FC<FabProps> = ({ onAddWorkItem, onAddReminder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex flex-col items-center gap-3">
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
            <span className="bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-md px-3 py-1.5 shadow-md whitespace-nowrap">
                Add Reminder
            </span>
            <button
              onClick={() => handleActionClick(onAddReminder)}
              className="inline-flex items-center justify-center w-12 h-12 bg-slate-500 text-white rounded-full shadow-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform hover:scale-110"
              aria-label="Add new reminder"
              title="Add Reminder"
            >
              <BellIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex items-center gap-3">
             <span className="bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-md px-3 py-1.5 shadow-md whitespace-nowrap">
                Add Work Item
            </span>
            <button
              onClick={() => handleActionClick(onAddWorkItem)}
              className="inline-flex items-center justify-center w-12 h-12 bg-slate-500 text-white rounded-full shadow-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform hover:scale-110"
              aria-label="Add new work item"
              title="Add Work Item"
            >
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-200"
        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}
        aria-label="Toggle actions menu"
        aria-expanded={isOpen}
      >
        <AddIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default Fab;
