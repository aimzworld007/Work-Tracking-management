
import React from 'react';
import { LockClosedIcon, LockOpenIcon } from './icons';

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({ isEditMode, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
      aria-label={isEditMode ? 'Disable editing' : 'Enable editing'}
      title={isEditMode ? 'Disable editing (View Mode)' : 'Enable editing (Edit Mode)'}
    >
      {isEditMode ? (
        <LockOpenIcon className="h-5 w-5" />
      ) : (
        <LockClosedIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default EditModeToggle;
