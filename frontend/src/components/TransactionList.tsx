import React, { useEffect, useState } from 'react';
import TransactionRow from './TransactionRow';
import type { Transaction } from '../models/transaction';
import { updateTransaction } from '../api/transactions';

interface Props {
  transactions: Transaction[];
  refreshTransactions: () => Promise<void>;
}

export const TransactionList: React.FC<Props> = ({
  transactions: propTransactions,
  refreshTransactions,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!transactionToEdit) return;
    try {
      await updateTransaction(transactionToEdit); // !Make sure to implement or import updateTransaction
      refreshTransactions();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  };

  const sortedTransactions = [...propTransactions].sort((a, b) => {
    return new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime();
  });
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const pagedTransactions = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

  if (propTransactions.length === 0) {
    return (
      <div className="w-[85%] mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-3">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="w-[85%] mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-3">
      {isEditModalOpen && transactionToEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Edit Transaction</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit();
              }}
            >
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  value={transactionToEdit.description}
                  onChange={(e) =>
                    setTransactionToEdit({ ...transactionToEdit, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  value={transactionToEdit.category}
                  onChange={(e) =>
                    setTransactionToEdit({ ...transactionToEdit, category: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-2 border-b border-gray-200 pb-2 px-1 mb-1 capitalize font-semibold text-gray-700">
        <div className="col-span-2">Date</div>
        <div className="col-span-4">Description</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>

      <div>
        {pagedTransactions.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            isMenuOpen={openMenuId === t.id}
            onMenuToggle={handleMenuToggle}
            onCloseMenu={handleCloseMenu}
            onUpdateComplete={refreshTransactions}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <div className="flex justify-center items-center pt-4 mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-sm rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &lt; Previous
          </button>
          {[...Array(totalPages).keys()].map((p) => (
            <button
              key={p + 1}
              className={`px-3 py-1 text-sm rounded ${
                page === p + 1
                  ? 'bg-gray-200 text-gray-800 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setPage(p + 1)}
            >
              {p + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 text-sm rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
