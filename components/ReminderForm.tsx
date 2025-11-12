import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { CloseIcon } from './icons';
import DatePicker from './DatePicker';

interface ReminderFormProps {
  item: WorkItem | null;
  onSave: (data: Partial<WorkItem>) => void;
  onClose: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '', // Used as reminder title for new reminders
    reminderDate: new Date().toISOString().split('T')[0],
    reminderNote: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        customerName: item.customerName,
        reminderDate: item.reminderDate || new Date().toISOString().split('T')[0],
        reminderNote: item.reminderNote || '',
      });
    } else {
       setFormData({
           customerName: '',
           reminderDate: new Date().toISOString().split('T')[0],
           reminderNote: '',
       });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (item) { // Editing existing item's reminder
      onSave({
        id: item.id,
        reminderDate: formData.reminderDate,
        reminderNote: formData.reminderNote,
      });
    } else { // Creating a new reminder task
      if (!formData.customerName) {
          alert('Reminder Title is required.');
          return;
      }
      onSave({
        customerName: formData.customerName,
        reminderDate: formData.reminderDate,
        reminderNote: formData.reminderNote,
        dateOfWork: new Date().toISOString(),
        workOfType: 'REMINDER',
        status: 'PENDING',
        salesPrice: 0,
        advance: 0,
        due: 0,
      });
    }
  };

  const handleClear = () => {
    if (item && window.confirm('Are you sure you want to clear this reminder?')) {
        onSave({
            id: item.id,
            reminderDate: '',
            reminderNote: '',
        });
    }
  }

  const isNewReminder = !item;

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
                                {isNewReminder ? 'Add Quick Reminder' : `Set Reminder for "${item.customerName}"`}
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit} id="reminderForm">
                                    <div className="grid grid-cols-1 gap-4">
                                        {isNewReminder && (
                                            <div>
                                                <label htmlFor="customerName" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Reminder Title</label>
                                                <div className="mt-2">
                                                    <input id="customerName" type="text" name="customerName" placeholder="What to remember?" value={formData.customerName} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" required />
                                                </div>
                                            </div>
                                        )}
                                        <DatePicker
                                            label="Reminder Date"
                                            value={formData.reminderDate}
                                            onChange={(date) => setFormData(prev => ({ ...prev, reminderDate: date }))}
                                        />
                                        <div>
                                            <label htmlFor="reminderNote" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Note (Optional)</label>
                                            <div className="mt-2">
                                                <textarea
                                                    id="reminderNote"
                                                    name="reminderNote"
                                                    rows={3}
                                                    value={formData.reminderNote}
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
                        Save
                    </button>
                    {!isNewReminder && (
                        <button type="button" onClick={handleClear} className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
                            Clear Reminder
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
