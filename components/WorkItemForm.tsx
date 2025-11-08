import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { CloseIcon } from './icons';
import DatePicker from './DatePicker';

interface WorkItemFormProps {
  item: WorkItem | null;
  onSave: (item: Omit<WorkItem, 'dayCount' | 'isArchived' | 'due'>) => void;
  onClose: () => void;
  workByOptions: string[];
  workTypeOptions: string[];
  statusOptions: string[];
}

const DatalistInput = ({ label, name, value, onChange, options, required = false }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, options: string[], required?: boolean }) => {
    const dataListId = `${name}-options`;
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">{label}</label>
            <div className="mt-2">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    list={dataListId}
                    className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    placeholder={`Type or select a ${label.toLowerCase()}`}
                    required={required}
                />
            </div>
            <datalist id={dataListId}>
                {options.map(opt => <option key={opt} value={opt} />)}
            </datalist>
        </div>
    );
};


const WorkItemForm: React.FC<WorkItemFormProps> = ({ item, onSave, onClose, workByOptions, workTypeOptions, statusOptions }) => {
  const [formData, setFormData] = useState<any>({
    id: undefined,
    dateOfWork: new Date().toISOString().split('T')[0],
    workBy: '',
    workOfType: '',
    status: statusOptions[0] || '',
    customerName: '',
    passportNumber: '',
    trackingNumber: '',
    mobileWhatsappNumber: '',
    salesPrice: 0,
    advance: 0,
  });
  
  const [isCustomWorkType, setIsCustomWorkType] = useState(false);

  useEffect(() => {
    if (item) {
      const isCustom = !workTypeOptions.includes(item.workOfType) && item.workOfType !== '';
      setIsCustomWorkType(isCustom);
      setFormData({
        id: item.id,
        dateOfWork: item.dateOfWork.split('T')[0],
        workBy: item.workBy,
        workOfType: item.workOfType,
        status: item.status,
        customerName: item.customerName,
        passportNumber: item.passportNumber,
        trackingNumber: item.trackingNumber,
        mobileWhatsappNumber: item.mobileWhatsappNumber,
        salesPrice: item.salesPrice || 0,
        advance: item.advance || 0,
      });
    } else {
       setIsCustomWorkType(false);
       setFormData({
           id: undefined,
           dateOfWork: new Date().toISOString().split('T')[0],
           workBy: '',
           workOfType: '',
           status: statusOptions[0] || '',
           customerName: '',
           passportNumber: '',
           trackingNumber: '',
           mobileWhatsappNumber: '971',
           salesPrice: 0,
           advance: 0,
       });
    }
  }, [item, workTypeOptions, statusOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWorkTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (value === '__custom__') {
          setIsCustomWorkType(true);
          setFormData(prev => ({ ...prev, workOfType: '' }));
      } else {
          setIsCustomWorkType(false);
          setFormData(prev => ({ ...prev, workOfType: value }));
      }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workOfType) {
        alert('Work Type is a required field.');
        return;
    }
    
    const { id, ...dataToSave } = formData;
    
    const submissionData: any = { ...dataToSave };
    if (id) {
        submissionData.id = id;
    }

    onSave(submissionData);
  };

  const due = (Number(formData.salesPrice) || 0) - (Number(formData.advance) || 0);

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
                         <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-100" id="modal-title">{item ? 'Edit Work Item' : 'Add New Work Item'}</h3>
                            <div className="mt-2">
                                <form onSubmit={handleSubmit} id="workItemForm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <DatePicker
                                            label="Date of Work"
                                            value={formData.dateOfWork}
                                            onChange={(date) => setFormData(prev => ({ ...prev, dateOfWork: date }))}
                                        />
                                        <DatalistInput label="Work By" name="workBy" value={formData.workBy} onChange={handleChange} options={workByOptions} />
                                        
                                        <div>
                                            <label htmlFor="workOfTypeSelect" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Work Type</label>
                                            <div className="mt-2">
                                                <select
                                                    id="workOfTypeSelect"
                                                    value={isCustomWorkType ? '__custom__' : formData.workOfType}
                                                    onChange={handleWorkTypeChange}
                                                    className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="" disabled>Select a type...</option>
                                                    {workTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    <option value="__custom__">Other (specify)</option>
                                                </select>
                                            </div>
                                            {isCustomWorkType && (
                                                <div className="mt-2">
                                                    <label htmlFor="workOfType" className="sr-only">Custom Work Type</label>
                                                    <input
                                                        type="text"
                                                        id="workOfType"
                                                        name="workOfType"
                                                        value={formData.workOfType}
                                                        onChange={handleChange}
                                                        className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                                        placeholder="Enter custom work type"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <DatalistInput label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
                                        <div className="md:col-span-2">
                                            <label htmlFor="customerName" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Customer Name</label>
                                            <div className="mt-2">
                                                <input id="customerName" type="text" name="customerName" placeholder="e.g. John Doe" value={formData.customerName} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="passportNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Passport Number</label>
                                            <div className="mt-2">
                                                <input id="passportNumber" type="text" name="passportNumber" placeholder="Passport Number" value={formData.passportNumber} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="trackingNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Tracking Number</label>
                                            <div className="mt-2">
                                                <input id="trackingNumber" type="text" name="trackingNumber" placeholder="Tracking Number" value={formData.trackingNumber} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="salesPrice" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Sales Price</label>
                                            <div className="mt-2">
                                                <input id="salesPrice" type="number" name="salesPrice" placeholder="0" value={formData.salesPrice} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="advance" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Advance</label>
                                            <div className="mt-2">
                                                <input id="advance" type="number" name="advance" placeholder="0" value={formData.advance} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="due" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Due</label>
                                            <div className="mt-2">
                                                <div className="block w-full rounded-md border-0 bg-slate-100 dark:bg-slate-900/50 py-1.5 px-3 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 sm:text-sm sm:leading-6">
                                                    {due.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="mobileWhatsappNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">Mobile/WhatsApp Number</label>
                                            <div className="mt-2">
                                                <input id="mobileWhatsappNumber" type="text" name="mobileWhatsappNumber" placeholder="Mobile/WhatsApp Number" value={formData.mobileWhatsappNumber} onChange={handleChange} className="block w-full rounded-md border-0 bg-white dark:bg-slate-900 py-1.5 text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="submit" form="workItemForm" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">
                        Save
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

export default WorkItemForm;