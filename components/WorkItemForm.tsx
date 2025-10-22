import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';

interface WorkItemFormProps {
  item: WorkItem | null;
  onSave: (item: Omit<WorkItem, 'dayCount' | 'isArchived'>) => void;
  onClose: () => void;
  workByOptions: string[];
  workTypeOptions: string[];
  statusOptions: string[];
}


// A component to handle an input with a datalist for suggestions.
const DatalistInput = ({ label, name, value, onChange, options, required = false }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, options: string[], required?: boolean }) => {
    const dataListId = `${name}-options`;
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                list={dataListId}
                className="mt-1 p-2 border rounded-md w-full"
                placeholder={`Type or select a ${label.toLowerCase()}`}
                required={required}
            />
            <datalist id={dataListId}>
                {options.map(opt => <option key={opt} value={opt} />)}
            </datalist>
        </div>
    );
};


const WorkItemForm: React.FC<WorkItemFormProps> = ({ item, onSave, onClose, workByOptions, workTypeOptions, statusOptions }) => {
  const [formData, setFormData] = useState({
    id: undefined,
    dateOfWork: new Date().toISOString().split('T')[0],
    workBy: '',
    workOfType: workTypeOptions[0] || '',
    status: statusOptions[0] || '',
    customerName: '',
    passportNumber: '',
    trackingNumber: '',
    mobileWhatsappNumber: '',
  });
  const [isAddingNewWorkType, setIsAddingNewWorkType] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        dateOfWork: item.dateOfWork,
        workBy: item.workBy,
        workOfType: item.workOfType,
        status: item.status,
        customerName: item.customerName,
        passportNumber: item.passportNumber,
        trackingNumber: item.trackingNumber,
        mobileWhatsappNumber: item.mobileWhatsappNumber,
      });
      if (workTypeOptions.length > 0 && !workTypeOptions.includes(item.workOfType)) {
        setIsAddingNewWorkType(true);
      } else {
        setIsAddingNewWorkType(false);
      }
    } else {
       // Set defaults for new item form
       setFormData(prev => ({
           ...prev,
           dateOfWork: new Date().toISOString().split('T')[0],
           workBy: '',
           customerName: '',
           passportNumber: '',
           trackingNumber: '',
           mobileWhatsappNumber: '',
           workOfType: workTypeOptions[0] || '',
           status: statusOptions[0] || '',
       }));
       setIsAddingNewWorkType(false);
    }
  }, [item, workByOptions, workTypeOptions, statusOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkTypeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === '__add_new__') {
      setIsAddingNewWorkType(true);
      setFormData(prev => ({ ...prev, workOfType: '' }));
    } else {
      setIsAddingNewWorkType(false);
      setFormData(prev => ({ ...prev, workOfType: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, ...dataToSave } = formData;
    
    const submissionData: any = { ...dataToSave };
    if (id) {
        submissionData.id = id;
    }

    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{item ? 'Edit Work Item' : 'Add New Work Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Date of Work</label>
                <input
                type="date"
                name="dateOfWork"
                value={formData.dateOfWork}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                required
                />
            </div>
             <DatalistInput
                label="Work By"
                name="workBy"
                value={formData.workBy}
                onChange={handleChange}
                options={workByOptions}
            />
            <div>
              <label htmlFor="workOfType" className="block text-sm font-medium text-gray-700">Work Type</label>
              <select
                id="workOfType"
                value={isAddingNewWorkType ? '__add_new__' : formData.workOfType}
                onChange={handleWorkTypeSelectChange}
                className="mt-1 p-2 border rounded-md w-full"
              >
                <option value="" disabled>Select a type</option>
                {workTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                <option value="__add_new__">Add New...</option>
              </select>
              {isAddingNewWorkType && (
                <input
                  type="text"
                  name="workOfType"
                  value={formData.workOfType}
                  onChange={handleChange}
                  className="mt-2 p-2 border rounded-md w-full"
                  placeholder="Enter new work type"
                  required
                  autoFocus
                />
              )}
            </div>
            <DatalistInput
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                required
            />
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                type="text"
                name="customerName"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <input
                type="text"
                name="passportNumber"
                placeholder="Passport Number"
                value={formData.passportNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                <input
                type="text"
                name="trackingNumber"
                placeholder="Tracking Number"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mobile/WhatsApp Number</label>
                <input
                type="text"
                name="mobileWhatsappNumber"
                placeholder="Mobile/WhatsApp Number"
                value={formData.mobileWhatsappNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkItemForm;