import React from 'react';

interface FontSizeAdjusterProps {
  onDecrease: () => void;
  onReset: () => void;
  onIncrease: () => void;
}

const FontSizeAdjuster: React.FC<FontSizeAdjusterProps> = ({ onDecrease, onReset, onIncrease }) => {
  const buttonClass = "flex items-center justify-center h-10 w-10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10";

  return (
    <div className="relative inline-flex rounded-md shadow-sm">
      <button
        type="button"
        onClick={onDecrease}
        className={`${buttonClass} rounded-l-md font-semibold text-sm`}
        title="Decrease font size"
      >
        A-
      </button>
      <button
        type="button"
        onClick={onReset}
        className={`${buttonClass} -ml-px border-l border-r border-slate-300 dark:border-slate-700 text-xs`}
        title="Reset font size"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onIncrease}
        className={`${buttonClass} -ml-px rounded-r-md font-semibold text-lg`}
        title="Increase font size"
      >
        A+
      </button>
    </div>
  );
};

export default FontSizeAdjuster;
