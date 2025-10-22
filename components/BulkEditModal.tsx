import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface BulkEditModalProps {
    onClose: () => void;
    onSave: (data: { status?: string; workBy?: string }) => void;
    workByOptions: string[];
    statusOptions: string[];
    selectedCount: number;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({ onClose, onSave, workByOptions, statusOptions, selectedCount }) => {
    const [status, setStatus] = useState('');
    const [workBy, setWorkBy] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: { status?: string; workBy?: string } = {};
        if (status) dataToSave.status = status;
        if (workBy) dataToSave.workBy = workBy;
        
        onSave(dataToSave);
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
                                    Bulk Edit {selectedCount} Items
                                </h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Only the fields you change will be updated across all selected items.
                                </p>
                                <div className="mt-4">
                                    <form onSubmit={handleSubmit} id="bulkEditForm">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Status</label>
                                                <div className="mt-2">
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        value={status}
                                                        onChange={e => setStatus(e.target.value)}
                                                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                    >
                                                        <option value="">Keep Unchanged</option>
                                                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="workBy" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Work By</label>
                                                <div className="mt-2">
                                                    <select
                                                        id="workBy"
                                                        name="workBy"
                                                        value={workBy}
                                                        onChange={e => setWorkBy(e.target.value)}
                                                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                    >
                                                        <option value="">Keep Unchanged</option>
                                                        {workByOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                            <button type="submit" form="bulkEditForm" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">
                                Save Changes
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

export default BulkEditModal;
