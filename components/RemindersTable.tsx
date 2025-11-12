import React from 'react';
import { Reminder } from '../types';
import ReminderRow from './ReminderRow';
import { BellIcon, ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from './icons';

interface RemindersTableProps {
    reminders: Reminder[];
    onEdit: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string, completed: boolean) => void;
    isEditMode: boolean;
    sortColumn: keyof Reminder | null;
    sortDirection: 'asc' | 'desc';
    onSort: (column: keyof Reminder) => void;
}

const RemindersTable: React.FC<RemindersTableProps> = ({ reminders, onEdit, onDelete, onToggleComplete, isEditMode, sortColumn, sortDirection, onSort }) => {
    
    const SortableHeader = ({ column, title, thClassName = '', buttonClassName = '' }: { column: keyof Reminder, title: string, thClassName?: string, buttonClassName?: string }) => {
        const isSorting = sortColumn === column;
        const Icon = isSorting ? (sortDirection === 'asc' ? ChevronUpIcon : ChevronDownIcon) : ChevronUpDownIcon;

        return (
            <th scope="col" className={`py-0 text-left text-sm font-semibold text-white transition-colors duration-200 ${thClassName}`}>
                <button
                    onClick={() => onSort(column)}
                    className={`group w-full h-full flex items-center justify-start gap-1 px-3 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset ${buttonClassName}`}
                >
                    <span>{title}</span>
                    <span className={`transition-opacity ${isSorting ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                        <Icon className="h-4 w-4" />
                    </span>
                </button>
            </th>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead>
                    <tr>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white bg-slate-600 w-12">S.N</th>
                        <SortableHeader column="reminderDate" title="Date" thClassName="bg-amber-500 hover:bg-amber-600" />
                        <SortableHeader column="title" title="Title & Note" thClassName="bg-amber-500 hover:bg-amber-600" />
                        <SortableHeader column="isCompleted" title="Completed" thClassName="bg-amber-500 hover:bg-amber-600 text-center" buttonClassName="justify-center" />
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right bg-slate-50 dark:bg-slate-800/50">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {reminders.map((reminder, index) => (
                        <ReminderRow
                            key={reminder.id}
                            serialNumber={index + 1}
                            reminder={reminder}
                            onEdit={() => onEdit(reminder)}
                            onDelete={() => { if (window.confirm('Are you sure you want to delete this reminder?')) onDelete(reminder.id!) }}
                            onToggleComplete={() => onToggleComplete(reminder.id!, !reminder.isCompleted)}
                            isEditMode={isEditMode}
                        />
                    ))}
                </tbody>
            </table>
             {reminders.length === 0 && (
                <div className="text-center py-16">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-200">No reminders found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Get started by creating a new reminder.</p>
                </div>
            )}
        </div>
    );
};

export default RemindersTable;