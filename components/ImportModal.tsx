import React, { useState } from 'react';

interface ImportModalProps {
  onClose: () => void;
  onImport: (data: string) => Promise<void>;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [data, setData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onImport(data);
    // Do not set isLoading to false here, as the component will be unmounted on success
  };

  const instructions = `Paste tab-separated data below (e.g., from Excel). The first line should be a header and will be ignored.
The expected columns are: S.N, Date of Work, Work By, Type Of Work, Status, Customer Name, Tracking Number, Mobile/WhatsApp Number.`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Import Work Items</h2>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
            <h3 className="font-semibold text-sm mb-1">Instructions</h3>
            <p className="text-xs whitespace-pre-wrap">{instructions}</p>
        </div>
        <textarea
          className="w-full flex-grow p-2 border rounded-md font-mono text-sm"
          rows={15}
          placeholder="Paste your data here..."
          value={data}
          onChange={(e) => setData(e.target.value)}
          disabled={isLoading}
          aria-label="Data to import"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading || !data.trim()}
          >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
                </>
            ) : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;