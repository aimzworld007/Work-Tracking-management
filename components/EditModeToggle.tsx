import React from 'react';

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

const EditModeToggle: React.FC<EditModeToggleProps> = ({ isEditMode, onToggle }) => {
  return (
    <div className="flex items-center gap-2" title={isEditMode ? 'Disable editing' : 'Enable editing'}>
      <button
        type="button"
        onClick={onToggle}
        className={`${
          isEditMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
        role="switch"
        aria-checked={isEditMode}
      >
        <span
          aria-hidden="true"
          className={`${
            isEditMode ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      <span className={`text-sm font-medium ${isEditMode ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
        Edit Mode
      </span>
    </div>
  );
};

export default EditModeToggle;