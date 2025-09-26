import React, { useRef } from 'react';
import { importTransactions } from '../api/transactions';

type ImportTransactionsProps = {
  userId: string;
  onImport: () => Promise<void>;
};

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ userId, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = async () => {
    await onImport();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }

    if (file) {
      await importTransactions(file, userId);
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
