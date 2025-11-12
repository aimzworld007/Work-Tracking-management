import React from 'react';

interface FirestoreErrorProps {
  error: string;
  rules: string;
}

const FirestoreError: React.FC<FirestoreErrorProps> = ({ error, rules }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rules).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy rules: ", err);
      alert("Could not copy rules to clipboard.");
    });
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Database Permission Error</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{error}</p>
            <p className="mt-2">This usually happens when the app doesn't have permission to read or write to the database. To fix this, you need to update your Firestore security rules.</p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">Action Required:</p>
            <ol className="list-decimal list-inside mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>Open your project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-red-600">Firebase Console</a>.</li>
              <li>Go to the <strong>Firestore Database</strong> section, then click the <strong>Rules</strong> tab.</li>
              <li>Replace the entire content of the rules editor with the code below.</li>
            </ol>
            <div className="mt-2 relative">
                <pre className="bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 p-3 rounded-md text-xs overflow-x-auto font-mono">
                    <code>{rules}</code>
                </pre>
                <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-red-200 dark:bg-red-800/80 text-red-800 dark:text-red-100 hover:bg-red-300 dark:hover:bg-red-700 px-2 py-1 text-xs rounded-md font-sans"
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirestoreError;
