import React, { useRef } from 'react';
import { importTransactions } from '../api/transactions';

type ImportTransactionsProps = {
  userId: string;
  onImportComplete: () => void;
};

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ userId, onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }
    if (file) {
      try {
        await importTransactions(file, userId);
        onImportComplete();
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Failed to import transactions.';
        alert(errorMessage);
        console.error('Failed to import transactions.', error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-6 text-gray-700 hover:text-gray-900 transition">
      <button type="button" onClick={handleButtonClick}>
        Import Transactions
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImportTransactions;
