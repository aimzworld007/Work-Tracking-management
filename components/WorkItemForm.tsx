import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon } from './icons';


interface WorkItemFormProps {
  item: WorkItem | null;
  onSave: (item: Omit<WorkItem, 'dayCount' | 'isArchived'>) => void;
  onClose: () => void;
  workByOptions: string[];
  workTypeOptions: string[];
  statusOptions: string[];
}

const WorkItemForm: React.FC<WorkItemFormProps> = ({ item, onSave, onClose, workByOptions, workTypeOptions, statusOptions }) => {
  const [formData, setFormData] = useState({
    id: undefined,
    dateOfWork: new Date().toISOString().split('T')[0],
    workBy: '',
    workOfType: workTypeOptions[0] || '',
    status: statusOptions[0] || '',
    customerName: '',
    trackingNumber: '',
    ppNumber: '',
    customerNumber: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        dateOfWork: item.dateOfWork,
        workBy: item.workBy,
        workOfType: item.workOfType,
        status: item.status,
        customerName: item.customerName,
        trackingNumber: item.trackingNumber,
        ppNumber: item.ppNumber,
        customerNumber: item.customerNumber,
      });
    } else {
       // Set defaults for new item form
       setFormData(prev => ({
           ...prev,
           workBy: workByOptions.includes(prev.workBy) ? prev.workBy : '',
           workOfType: workTypeOptions[0] || '',
           status: statusOptions[0] || '',
       }));
    }
  }, [item, workTypeOptions, statusOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following text and extract work item details. If a value is not present, leave it as an empty string. Choose from the provided options where applicable.
            
            Available Work Types: ${workTypeOptions.join(', ')}
            Available Statuses: ${statusOptions.join(', ')}
            Available 'Work By' names: ${workByOptions.join(', ')}

            Text: "${aiPrompt}"
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        workBy: { type: Type.STRING },
                        workOfType: { type: Type.STRING },
                        status: { type: Type.STRING },
                        customerName: { type: Type.STRING },
                        trackingNumber: { type: Type.STRING },
                        ppNumber: { type: Type.STRING },
                        customerNumber: { type: Type.STRING },
                    }
                },
            },
        });
        const resultText = response.text;
        let parsedData;
        try {
            parsedData = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            alert("AI returned an invalid response. Please try again.");
            return;
        }


        setFormData(prev => ({
            ...prev,
            ...parsedData,
            workOfType: parsedData.workOfType || prev.workOfType,
            status: parsedData.status || prev.status,
            workBy: parsedData.workBy || prev.workBy,
        }));

    } catch (error) {
        console.error("Error generating with AI:", error);
        alert("Failed to generate details with AI. Please check the console for errors.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  // A component to handle a select dropdown that can also accept new values
  const SelectWithAddNew = ({ label, name, value, onChange, options }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, options: string[] }) => {
    const [isNew, setIsNew] = useState(false);
    const showAddNew = value === 'add_new';

    useEffect(() => {
        // if the current value is not in the options list (and not 'add_new'), it must be a custom new value
        if (value && !options.includes(value) && value !== 'add_new') {
            setIsNew(true);
        } else if (value !== 'add_new') {
            setIsNew(false);
        }
    }, [value, options]);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {isNew || showAddNew ? (
          <input
            type="text"
            name={name}
            value={showAddNew ? '' : value}
            onChange={onChange}
            className="mt-1 p-2 border rounded-md w-full"
            placeholder={`Enter new ${label.toLowerCase()}...`}
            required
          />
        ) : (
          <select name={name} value={value} onChange={onChange} className="mt-1 p-2 border rounded-md w-full">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="add_new">-- Add New --</option>
          </select>
        )}
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{item ? 'Edit Work Item' : 'Add New Work Item'}</h2>
        <form onSubmit={handleSubmit}>
           <div className="mb-4 p-4 border rounded-lg bg-slate-50">
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">Describe with AI</label>
              <textarea
                  id="ai-prompt"
                  rows={3}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., New Pakistani PP renewal for John Doe, tracking # 123, by Ainul"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 disabled:bg-indigo-300"
              >
                  {isGenerating ? 'Generating...' : 'Generate Details'}
                  <SparklesIcon />
              </button>
          </div>

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
             <SelectWithAddNew
                label="Work By"
                name="workBy"
                value={formData.workBy}
                onChange={handleChange}
                options={workByOptions}
            />
            <SelectWithAddNew
                label="Work Type"
                name="workOfType"
                value={formData.workOfType}
                onChange={handleChange}
                options={workTypeOptions}
            />
            <SelectWithAddNew
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
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
                <label className="block text-sm font-medium text-gray-700">PP Number</label>
                <input
                type="text"
                name="ppNumber"
                placeholder="PP Number"
                value={formData.ppNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md w-full"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Customer Number</label>
                <input
                type="text"
                name="customerNumber"
                placeholder="Customer Number"
                value={formData.customerNumber}
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