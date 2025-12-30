
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface StatusReassignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newStatus: string) => void;
    itemToDelete: string;
    options: string[];
    itemType: 'Status' | 'Work Type';
}

const StatusReassignModal: React.FC<StatusReassignModalProps> = ({ isOpen, onClose, onConfirm, itemToDelete, options, itemType }) => {
    const availableOptions = options.filter(opt => opt.toLowerCase() !== itemToDelete.toLowerCase());
    const [newStatus, setNewStatus] = useState(availableOptions[0] || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStatus) {
            alert(`Please select a new ${itemType} to migrate to.`);
            return;
        }
        onConfirm(newStatus);
    };

    return (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 dark:bg-black bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                        <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                            <button type="button" onClick={onClose} className="rounded-md bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                <span className="sr-only">Close</span>
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">
                                    Reassign Items
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        The {itemType.toLowerCase()} "<strong>{itemToDelete}</strong>" is currently in use. Before deleting it, please choose a new {itemType.toLowerCase()} to assign to the affected items.
                                    </p>
                                    <form onSubmit={handleSubmit} id="reassignForm" className="mt-4">
                                        <label htmlFor="newStatus" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                                            Assign items to {itemType.toLowerCase()}:
                                        </label>
                                        <select
                                            id="newStatus"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="mt-2 block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        >
                                            {availableOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                            <button type="submit" form="reassignForm" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
                                Reassign and Delete
                            </button>
                            <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusReassignModal;
