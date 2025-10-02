import React, { useRef, useState } from 'react';
import { formatAmount, formatDate } from '../utils/format';
import type { Transaction } from '../models/transaction';
import { importTransactions } from '../api/transactions';

type ImportTransactionsProps = {
  onImportComplete: () => void;
};

type ImportPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewData: Transaction[];
  isImporting: boolean;
  error: string | null;
};

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  previewData,
  isImporting,
  error,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Import Preview</h3>
          <p className="text-sm text-gray-600">
            Review {previewData.length} transactions before importing
          </p>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        <div className="overflow-auto max-h-96 p-4">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Description
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Category
                </th>
                <th className="border border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((t, idx) => (
                <tr
                  key={t.id || `${t.transactionDateTime}-${t.description}-${t.amount}-${idx}`}
                  className="hover:bg-gray-50"
                >
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {formatDate(t.transactionDateTime)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{t.description}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${t.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {t.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right">
                    <span
                      className={`font-medium text-sm ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatAmount(t.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : `Import ${previewData.length} Transactions`}
          </button>
        </div>
      </div>
    </div>
  );
};

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<Transaction[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (file) {
      // TODO: Parse CSV and preview transactions here. Maybe just preview first page (20 items)?
      const mockImportData: Transaction[] = [
        {
          description: 'Coffee Shop',
          amount: -350,
          category: 'Food & Dining',
          type: 'Debit',
          transactionDateTime: '2024-01-20T08:30:00Z',
        },
        {
          description: 'ATM Withdrawal',
          amount: -2000,
          category: '',
          type: 'Debit',
          transactionDateTime: '2024-01-19T16:20:00Z',
        },
      ];
      setImportPreviewData(mockImportData);
      setShowImportPreview(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = async () => {
    setIsImporting(true);
    setError(null);
    try {
      setShowImportPreview(false);
      setImportPreviewData([]);
      await importTransactions(importPreviewData as unknown as File);
      onImportComplete();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to import transactions.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
      <ImportPreviewModal
        isOpen={showImportPreview}
        onClose={() => setShowImportPreview(false)}
        onConfirm={handleImportConfirm}
        previewData={importPreviewData}
        isImporting={isImporting}
        error={error}
      />
    </div>
  );
};

export default ImportTransactions;
