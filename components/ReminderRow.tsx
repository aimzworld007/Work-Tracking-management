import React from 'react';
import { Reminder } from '../types';
import { EditIcon, DeleteIcon } from './icons';

interface ReminderRowProps {
    serialNumber: number;
    reminder: Reminder;
    onEdit: () => void;
    onDelete: () => void;
    onToggleComplete: () => void;
    isEditMode: boolean;
}

const ReminderRow: React.FC<ReminderRowProps> = ({ serialNumber, reminder, onEdit, onDelete, onToggleComplete, isEditMode }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.reminderDate);
    reminderDate.setHours(0, 0, 0, 0);
    const isDue = reminderDate <= today;

    const rowClasses = `
        ${reminder.isCompleted ? 'bg-green-50 dark:bg-green-900/20 text-slate-500 dark:text-slate-500 line-through opacity-70' : ''}
        ${!reminder.isCompleted && isDue ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
        hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors duration-150
    `;

    return (
        <tr className={rowClasses}>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-center font-medium align-top">{serialNumber}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium align-top">{formatDate(reminder.reminderDate)}</td>
            <td className="px-3 py-4 text-sm align-top">
                <div className={`font-medium ${reminder.isCompleted ? '' : 'text-slate-900 dark:text-slate-100'}`}>{reminder.title}</div>
                {reminder.note && <div className="text-xs mt-1 whitespace-normal">{reminder.note}</div>}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-center align-top">
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-slate-800 dark:border-slate-600 dark:checked:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    checked={reminder.isCompleted}
                    onChange={onToggleComplete}
                    disabled={!isEditMode}
                    title={isEditMode ? (reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete') : 'Completion status'}
                />
            </td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 align-top">
                {isEditMode && (
                    <div className="flex justify-end items-center gap-1">
                        <button onClick={onEdit} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md transition-colors" title="Edit Reminder">
                            <EditIcon className="h-4 w-4" />
                        </button>
                        <button onClick={onDelete} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-1.5 rounded-md transition-colors" title="Delete Reminder">
                            <DeleteIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default ReminderRow;
