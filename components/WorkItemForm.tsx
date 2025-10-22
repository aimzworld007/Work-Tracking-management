import React, { useState, useEffect } from 'react';
import { WorkItem, Status } from '../types';

const ADD_NEW_VALUE = '__add_new__';

interface SelectWithAddNewProps {
    label: string;
    name: keyof Omit<WorkItem, 'id' | 'dateOfWork' | 'dayCount' | 'notes'>;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onAddNew: (newValue: string) => void;
    required?: boolean;
}

const SelectWithAddNew: React.FC<SelectWithAddNewProps> = ({ label, name, value, options, onChange, onAddNew, required = false }) => {
    const [showAddNew, setShowAddNew] = useState(false);
    const [newOptionValue, setNewOptionValue] = useState('');

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === ADD_NEW_VALUE) {
            setShowAddNew(true);
        } else {
            setShowAddNew(false);
            onChange(e);
        }
    };

    const handleAddNew = () => {
        if (newOptionValue.trim()) {
            onAddNew(newOptionValue.trim());
            // Simulate change event to select the new value
            const syntheticEvent = {
                target: { name, value: newOptionValue.trim() }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
            setNewOptionValue('');
            setShowAddNew(false);
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
            <select
                id={name}
                name={name}
                value={showAddNew ? ADD_NEW_VALUE : value}
                onChange={handleSelectChange}
                required={required}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="" disabled>Select an option</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
                <option value={ADD_NEW_VALUE} className="font-bold text-blue-600">
                    + Add New...
                </option>
            </select>
            {showAddNew && (
                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`New ${label}...`}
                        autoFocus
                    />
                    <button type="button" onClick={handleAddNew} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add</button>
                </div>
            )}
        </div>
    );
}


interface WorkItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<WorkItem, 'id'> & { id?: number }) => void;
  itemToEdit: WorkItem | null;
  workTypeOptions: string[];
  statusOptions: string[];
  workByOptions: string[];
  onAddWorkType: (newType: string) => void;
  onAddStatus: (newStatus: string) => void;
  onAddWorkBy: (newWorkBy: string) => void;
}

const WorkItemForm: React.FC<WorkItemFormProps> = ({ isOpen, onClose, onSave, itemToEdit, workTypeOptions, statusOptions, workByOptions, onAddWorkType, onAddStatus, onAddWorkBy }) => {
  const [formData, setFormData] = useState<Omit<WorkItem, 'id' | 'dateOfWork'> & {dateOfWork: string}>({
    dateOfWork: new Date().toISOString().split('T')[0],
    workBy: '',
    workOfType: workTypeOptions[0] || '',
    status: statusOptions[0] as Status || '',
    customerName: '',
    trackingNumber: '',
    ppNumber: '',
    customerNumber: '',
    dayCount: 0,
    notes: '',
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        dateOfWork: itemToEdit.dateOfWork.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        dateOfWork: new Date().toISOString().split('T')[0],
        workBy: '',
        workOfType: workTypeOptions[0] || '',
        status: statusOptions[0] as Status || '',
        customerName: '',
        trackingNumber: '',
        ppNumber: '',
        customerNumber: '',
        dayCount: 0,
        notes: '',
      });
    }
  }, [itemToEdit, isOpen, workTypeOptions, statusOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'dayCount' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave = {
      ...formData,
      id: itemToEdit?.id,
      dateOfWork: new Date(formData.dateOfWork),
    };
    onSave(itemToSave);
  };

  if (!isOpen) {
    return null;
  }
  
  const InputField = ({ label, name, value, onChange, type = 'text', required = false }: { label: string, name: keyof typeof formData, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean }) => (
    <div>
        <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-6 border-b z-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{itemToEdit ? 'Edit Work Item' : 'Add New Work Item'}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none">&times;</button>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
            <InputField label="Customer Number" name="customerNumber" value={formData.customerNumber} onChange={handleChange} />

            <SelectWithAddNew label="Type Of Work" name="workOfType" value={formData.workOfType} options={workTypeOptions} onChange={handleChange} onAddNew={onAddWorkType} required />
            <SelectWithAddNew label="Status" name="status" value={formData.status} options={statusOptions} onChange={handleChange} onAddNew={onAddStatus} required />
            <SelectWithAddNew label="Work By" name="workBy" value={formData.workBy} options={workByOptions} onChange={handleChange} onAddNew={onAddWorkBy} />

            <InputField label="Date of Work" name="dateOfWork" value={formData.dateOfWork} onChange={handleChange} type="date" required />
            <InputField label="Tracking Number" name="trackingNumber" value={formData.trackingNumber} onChange={handleChange} />
            <InputField label="PP Number" name="ppNumber" value={formData.ppNumber} onChange={handleChange} />
            <InputField label="Day Count" name="dayCount" value={formData.dayCount} onChange={handleChange} type="number" required />
          </div>

          <div>
             <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
              <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          
          <div className="flex justify-end pt-4 space-x-3 sticky bottom-0 bg-white py-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-semibold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkItemForm;