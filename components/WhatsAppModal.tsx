
import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { CloseIcon, WhatsAppIcon } from './icons';

interface WhatsAppModalProps {
  item: WorkItem | null;
  onClose: () => void;
  onArchive: () => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ item, onClose, onArchive }) => {
  const [message, setMessage] = useState('');
  const [shouldArchive, setShouldArchive] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (item) {
      const formattedDate = formatDate(item.dateOfWork);
      const defaultMessage = `Dear ${item.customerName},\n\nThis is to inform you that your application for "${item.workOfType}" submitted on ${formattedDate} has been approved.\n\nTracking Number: ${item.trackingNumber || 'N/A'}\n\nYou can collect it from our office. Thank you!`;
      setMessage(defaultMessage);
    }
  }, [item]);

  if (!item) return null;

  const handleSend = () => {
    const cleanedNumber = item.mobileWhatsappNumber.replace(/\D/g, '');
    if (!cleanedNumber) {
      alert('Invalid phone number.');
      return;
    }
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    if (shouldArchive) {
        onArchive();
    }
    onClose();
  };

  const handleClose = () => {
      if (shouldArchive) {
          onArchive();
      }
      onClose();
  }

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 dark:bg-black bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                        <button type="button" onClick={handleClose} className="rounded-md bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <span className="sr-only">Close</span>
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                             <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 sm:mx-0 sm:h-10 sm:w-10">
                                <WhatsAppIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                             <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">Send WhatsApp Notification</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        The status for <strong>{item.customerName}</strong> has been set to "Approved". Would you like to send a notification?
                                    </p>
                                    <div className="mt-4">
                                        <label htmlFor="message" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Message</label>
                                        <div className="mt-2">
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={6}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="relative flex items-start">
                                            <div className="flex h-6 items-center">
                                                <input
                                                    id="archive"
                                                    name="archive"
                                                    type="checkbox"
                                                    checked={shouldArchive}
                                                    onChange={(e) => setShouldArchive(e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm leading-6">
                                                <label htmlFor="archive" className="font-medium text-slate-900 dark:text-slate-200 cursor-pointer">
                                                    Archive this item
                                                </label>
                                                <p className="text-gray-500 dark:text-slate-400">
                                                    The item will be moved to the archives.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={handleSend}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                        >
                            <WhatsAppIcon className="h-5 w-5" />
                            Send on WhatsApp
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default WhatsAppModal;
