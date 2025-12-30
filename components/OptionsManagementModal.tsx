
import React, { useState } from 'react';
import { CloseIcon, EditIcon, DeleteIcon, CheckIcon, AddIcon } from './icons';
import { WorkTypeConfig, toTitleCase } from '../types';

interface OptionsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  workTypeOptions: WorkTypeConfig[];
  statusOptions: string[];
  onAddWorkType: (value: WorkTypeConfig) => void;
  onDeleteWorkType: (value: string) => void;
  onEditWorkType: (oldValue: string, newValue: WorkTypeConfig) => void;
  onAddStatus: (value: string) => void;
  onDeleteStatus: (value: string) => void;
  onEditStatus: (oldValue: string, newValue: string) => void;
}

const OptionsList: React.FC<{
    options: any[]; // Can be WorkTypeConfig[] or string[]
    onAdd: (value: any) => void;
    onDelete: (value: string) => void;
    onEdit: (oldValue: string, newValue: any) => void;
    itemTypeName: string;
    isWorkType?: boolean;
}> = ({ options, onAdd, onDelete, onEdit, itemTypeName, isWorkType = false }) => {
    const [editingOption, setEditingOption] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [editingUrl, setEditingUrl] = useState('');
    const [newItemValue, setNewItemValue] = useState('');
    const [newItemUrl, setNewItemUrl] = useState('');

    const handleEditClick = (option: any) => {
        const name = isWorkType ? option.name : option;
        setEditingOption(name);
        setEditingValue(name);
        if (isWorkType) {
            setEditingUrl(option.trackingUrl || '');
        }
    };

    const handleSaveEdit = () => {
        if (editingOption && editingValue.trim()) {
            const newValue = isWorkType ? { name: toTitleCase(editingValue.trim()), trackingUrl: editingUrl.trim() } : toTitleCase(editingValue.trim());
            onEdit(editingOption, newValue);
        }
        setEditingOption(null);
        setEditingValue('');
        setEditingUrl('');
    };
    
    const handleCancelEdit = () => {
        setEditingOption(null);
        setEditingValue('');
        setEditingUrl('');
    };
    
    const handleAddNew = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemValue.trim()) {
            const newValue = isWorkType ? { name: toTitleCase(newItemValue.trim()), trackingUrl: newItemUrl.trim() } : toTitleCase(newItemValue.trim());
            onAdd(newValue);
            setNewItemValue('');
            setNewItemUrl('');
        }
    };

    return (
        <div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-60 overflow-y-auto pr-2">
                {options.map((option) => {
                    const name = isWorkType ? option.name : option;
                    const url = isWorkType ? option.trackingUrl : undefined;
                    return (
                        <li key={name} className="py-2 flex items-center justify-between">
                            {editingOption === name ? (
                                <div className="flex-grow flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                            autoFocus
                                        />
                                        <button onClick={handleSaveEdit} className="p-1.5 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50">
                                            <CheckIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={handleCancelEdit} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <CloseIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {isWorkType && (
                                        <input
                                            type="text"
                                            placeholder="Tracking URL (optional)"
                                            value={editingUrl}
                                            onChange={(e) => setEditingUrl(e.target.value)}
                                            className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                                        />
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-800 dark:text-slate-200">{name}</span>
                                        {isWorkType && url && <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{url}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditClick(option)} className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700" title={`Edit ${name}`}>
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => onDelete(name)} className="p-1.5 rounded-md text-slate-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700" title={`Delete ${name}`}>
                                            <DeleteIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>
             <form onSubmit={handleAddNew} className="mt-4 flex flex-col gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                 <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                        placeholder={`New ${itemTypeName.toLowerCase()} name...`}
                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm"
                    />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50" disabled={!newItemValue.trim()}>
                        <AddIcon className="h-5 w-5 -ml-1" />
                        Add
                    </button>
                </div>
                 {isWorkType && (
                    <input
                        type="text"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        placeholder="Tracking URL (optional)"
                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm"
                    />
                 )}
            </form>
        </div>
    );
};

const OptionsManagementModal: React.FC<OptionsManagementModalProps> = ({ isOpen, onClose, ...props }) => {
    const [activeTab, setActiveTab] = useState<'workTypes' | 'statuses'>('workTypes');
    
    if (!isOpen) return null;

    const tabClass = (tabName: 'workTypes' | 'statuses') =>
        `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === tabName
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
        }`;

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
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">
                                Manage Options
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Add, edit, or delete options for Work Types and Statuses.
                            </p>
                            <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('workTypes')} className={tabClass('workTypes')}>Work Types</button>
                                    <button onClick={() => setActiveTab('statuses')} className={tabClass('statuses')}>Statuses</button>
                                </nav>
                            </div>
                            <div className="mt-4">
                                {activeTab === 'workTypes' ? (
                                    <OptionsList
                                        options={props.workTypeOptions}
                                        onAdd={props.onAddWorkType}
                                        onDelete={props.onDeleteWorkType}
                                        onEdit={props.onEditWorkType}
                                        itemTypeName="Work Type"
                                        isWorkType={true}
                                    />
                                ) : (
                                    <OptionsList
                                        options={props.statusOptions}
                                        onAdd={props.onAddStatus}
                                        onDelete={props.onDeleteStatus}
                                        onEdit={props.onEditStatus}
                                        itemTypeName="Status"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 sm:w-auto"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsManagementModal;