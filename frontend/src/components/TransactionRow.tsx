import React, { useRef, useEffect } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { formatDate, formatAmount } from '../utils/format';
import { deleteTransaction } from '../api/transactions';
import type { Transaction } from '../models/transaction';

interface TransactionRowProps {
  transaction: Transaction;
  isMenuOpen?: boolean;
  onMenuToggle: (id: string) => void;
  onCloseMenu: () => void;
  onUpdateComplete: () => Promise<void>;
  onEdit: (transaction: Transaction) => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  isMenuOpen,
  onMenuToggle,
  onCloseMenu,
  onUpdateComplete,
  onEdit,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCloseMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCloseMenu]);

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 py-2 px-2 hover:bg-gray-50 relative">
      <div className="col-span-2 text-gray-800">{formatDate(transaction.transactionDateTime)}</div>
      <div className="col-span-4 text-gray-800 capitalize">{transaction.description}</div>
      <div className="col-span-3">
        <span className="bg-gray-100 text-gray-700 text-sm font-regular me-2 px-2.5 py-0.5 rounded-full">
          {transaction.category}
        </span>
      </div>
      <div
        className={`col-span-2 text-right ${
          transaction.amount >= 0 ? 'text-green-800' : 'text-gray-800'
        }`}
      >
        {formatAmount(transaction.amount)}
      </div>
      <div className="col-span-1 flex items-center justify-center relative">
        <button
          className="text-gray-400 hover:text-gray-800 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle(transaction.id);
          }}
        >
          <EllipsisVertical size={20} />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-111/200 top-1/2 -translate-y-1/2 ml-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10"
          >
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                onEdit(transaction);
                onCloseMenu();
              }}
            >
              <svg
                className="mr-2 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z" />
              </svg>
              Edit
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this transaction?')) {
                  deleteTransaction(transaction.id)
                    .then(() => {
                      onUpdateComplete();
                    })
                    .catch((err) => {
                      console.error('Failed to delete transaction:', err);
                    });
                }
                onCloseMenu();
              }}
            >
              <svg
                className="mr-2 h-4 w-4 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
                <path d="M9 11v6M15 11v6" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionRow;
