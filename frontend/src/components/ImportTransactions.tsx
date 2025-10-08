import React, { useRef, useState } from 'react';
import { importTransactions } from '../api/transactions';

type ImportTransactionsProps = {
  onImportComplete: () => void;
};

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (file) {
      try {
        setIsImporting(true);
        await importTransactions(file);
        onImportComplete();
      } catch (err) {
        setError('Failed to import transactions.');
        console.error(err); // !Hide from users
      } finally {
        setIsImporting(false);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  return (
    <div className="mx-6 text-gray-700 hover:text-gray-900 transition">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isImporting}
        className="w-48 py-1 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition disabled:opacity-50"
      >
        {isImporting ? 'Importing...' : 'Import Transactions'}
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {/* TODO: Use a modal component */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold text-red-600">Error</h2>
            <p className="text-gray-700 mt-2">{error}</p>
            <button
              onClick={closeErrorPopup}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTransactions;
