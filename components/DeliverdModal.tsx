
import React, { useState, useEffect } from 'react';
import { WorkItem, toTitleCase } from '../types';
import { CloseIcon, WhatsAppIcon, ArchiveIcon } from './icons';

interface DeliverdModalProps {
  item: WorkItem;
  onClose: () => void;
  onArchive: () => void;
}

const DeliverdModal: React.FC<DeliverdModalProps> = ({ item, onClose, onArchive }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (item) {
      const defaultMessage = `Dear ${toTitleCase(item.customerName)},\n\nThis is to confirm that your item "${toTitleCase(item.workOfType)}" has been delivered. Thank you for your business!`;
      setMessage(defaultMessage);
    }
  }, [item]);

  if (!item) return null;

  const handleSendWhatsApp = () => {
    const cleanedNumber = item.mobileWhatsappNumber.replace(/\D/g, '');
    if (!cleanedNumber) {
      alert('Invalid phone number.');
      return;
    }
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleArchiveItem = () => {
      if (window.confirm('Are you sure you want to archive this item?')) {
          onArchive();
          onClose();
      }
  };

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 dark:bg-black bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                        <button type="button" onClick={onClose} className="rounded-md bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <span className="sr-only">Close</span>
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                             <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 sm:mx-0 sm:h-10 sm:w-10">
                                <ArchiveIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                             <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">Item Delivered</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        The item for <strong>{toTitleCase(item.customerName)}</strong> is marked as delivered. You can send a final notification or archive it.
                                    </p>
                                    <div className="mt-4">
                                        <label htmlFor="message" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">WhatsApp Message</label>
                                        <div className="mt-2">
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700 gap-2">
                        <button
                            type="button"
                            onClick={handleArchiveItem}
                            className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto mt-3 sm:mt-0"
                        >
                            <ArchiveIcon className="h-5 w-5" />
                            Archive Item
                        </button>
                        <button
                            type="button"
                            onClick={handleSendWhatsApp}
                            className="inline-flex w-full justify-center items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto mt-3 sm:mt-0"
                        >
                            <WhatsAppIcon className="h-5 w-5" />
                            Send on WhatsApp
                        </button>
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

export default DeliverdModal;
