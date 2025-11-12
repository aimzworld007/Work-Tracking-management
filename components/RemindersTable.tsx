import React from 'react';
import { Reminder } from '../types';
import ReminderRow from './ReminderRow';
import { BellIcon } from './icons';

interface RemindersTableProps {
    reminders: Reminder[];
    onEdit: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string, completed: boolean) => void;
    isEditMode: boolean;
}

const RemindersTable: React.FC<RemindersTableProps> = ({ reminders, onEdit, onDelete, onToggleComplete, isEditMode }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead>
                    <tr>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white bg-slate-600">S.N</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white bg-amber-500">Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white bg-amber-500">Title & Note</th>
                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white bg-amber-500">Completed</th>
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
