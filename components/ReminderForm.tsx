import React, { useState, useEffect } from 'react';
import { WorkItem, Reminder } from '../types';
import { CloseIcon } from './icons';
import DatePicker from './DatePicker';

interface ReminderFormProps {
  // To link a reminder to an existing work item
  linkedWorkItem?: WorkItem | null;
  // To edit an existing reminder
  existingReminder?: Reminder | null;
  onSave: (data: Partial<Reminder>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ linkedWorkItem, existingReminder, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    reminderDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    if (existingReminder) {
      setFormData({
        title: existingReminder.title,
        reminderDate: existingReminder.reminderDate.split('T')[0],
        note: existingReminder.note || '',
      });
    } else if (linkedWorkItem) {
      setFormData({
        title: `Follow up with ${linkedWorkItem.customerName} (${linkedWorkItem.workOfType})`,
        reminderDate: new Date().toISOString().split('T')[0],
        note: '',
      });
    } else {
       setFormData({
           title: '',
           reminderDate: new Date().toISOString().split('T')[0],
           note: '',
       });
    }
  }, [linkedWorkItem, existingReminder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
        alert('Reminder Title is required.');
        return;
    }
    
    if (existingReminder) {
        onSave({
            id: existingReminder.id,
            title: formData.title,
            reminderDate: formData.reminderDate,
            note: formData.note,
        });
    } else {
        const newReminder: Partial<Reminder> = {
            title: formData.title,
            reminderDate: formData.reminderDate,
            note: formData.note,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        };
        if (linkedWorkItem) {
            newReminder.workItemId = linkedWorkItem.id;
        }
        onSave(newReminder);
    }
  };

  const handleDelete = () => {
    if (existingReminder && onDelete && window.confirm('Are you sure you want to delete this reminder?')) {
        onDelete(existingReminder.id!);
    }
  }

  const isEditing = !!existingReminder;
  const isLinked = !!linkedWorkItem && !existingReminder;
  const modalTitle = isEditing ? 'Edit Reminder' : isLinked ? `Set Reminder for "${linkedWorkItem.customerName}"` : 'Add Quick Reminder';


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
                    <div className="sm:flex sm:items-start">
                         <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">
                                {modalTitle}
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit} id="reminderForm">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Reminder Title</label>
                                            <div className="mt-2">
                                                <input id="title" type="text" name="title" placeholder="What to remember?" value={formData.title} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" required />
                                            </div>
                                        </div>
                                        <DatePicker
                                            label="Reminder Date"
                                            value={formData.reminderDate}
                                            onChange={(date) => setFormData(prev => ({ ...prev, reminderDate: date }))}
                                        />
                                        <div>
                                            <label htmlFor="note" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Note (Optional)</label>
                                            <div className="mt-2">
                                                <textarea
                                                    id="note"
                                                    name="note"
                                                    rows={3}
                                                    value={formData.note}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                    placeholder="Add more details..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" form="reminderForm" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">
                        Save Reminder
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleDelete} className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
                            Delete
                        </button>
                    )}
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

export default ReminderForm;
