import React from 'react';
import { PrintIcon, EditIcon, DeleteIcon, CloseIcon } from './icons';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onPrint: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditMode: boolean;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ selectedCount, onClearSelection, onPrint, onEdit, onDelete, isEditMode }) => {
  return (
    <div className="sticky top-4 z-20">
        <div className="flex h-16 items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 my-4 ring-1 ring-indigo-500/50 dark:ring-indigo-500/70">
          <div className="flex items-center gap-2">
            <button 
                type="button" 
                onClick={onClearSelection} 
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                aria-label="Clear selection"
                title="Clear selection"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedCount} selected</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPrint} className="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
              <PrintIcon className="h-4 w-4" /> Print
            </button>
            {isEditMode && (
              <>
                <button onClick={onEdit} className="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <EditIcon className="h-4 w-4" /> Edit
                </button>
                <button onClick={onDelete} className="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">
                  <DeleteIcon className="h-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
    </div>
  );
};

export default BulkActionToolbar;