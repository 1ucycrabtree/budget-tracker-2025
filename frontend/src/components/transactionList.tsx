import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Upload } from 'lucide-react';
import type { Transaction } from '../models/transaction';
import { formatDate, formatAmount } from '../utils/format';

interface Category {
  name: string;
  keywords: string[];
}

interface Props {
  transactions: Transaction[];
  categories?: Category[];
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction?: (id: string) => void;
}

const TransactionRow: React.FC<{
  transaction: Transaction;
  categories: Category[];
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  hoveredCell: { col: string; id: string | null };
  setHoveredCell: (cell: { col: string; id: string | null }) => void;
}> = ({ transaction, categories, onUpdate, onDelete, hoveredCell, setHoveredCell }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editDescription, setEditDescription] = useState(transaction.description);
  const [editCategory, setEditCategory] = useState(transaction.category);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleSaveDescription = () => {
    if (transaction.id) {
      onUpdate(transaction.id, { description: editDescription });
    }
    setIsEditingDescription(false);
  };
  const handleCancelDescription = () => {
    setEditDescription(transaction.description);
    setIsEditingDescription(false);
  };
  const handleSaveCategory = () => {
    if (transaction.id) {
      onUpdate(transaction.id, { category: editCategory });
    }
    setIsEditingCategory(false);
    setIsAddingCategory(false);
    setNewCategory('');
  };
  const handleCancelCategory = () => {
    setEditCategory(transaction.category);
    setIsEditingCategory(false);
    setIsAddingCategory(false);
    setNewCategory('');
  };
  const handleDelete = () => {
    if (transaction.id) {
      onDelete(transaction.id);
    }
    setShowDeleteConfirm(false);
  };
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setEditCategory(newCategory.trim());
      setIsAddingCategory(false);
      setNewCategory('');
    }
  };

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="border border-gray-300 px-4 py-2">
        {formatDate(transaction.transactionDateTime)}
      </td>
      {/* Description cell */}
      <td
        className="border border-gray-300 px-4 py-2 relative"
        onMouseEnter={() => setHoveredCell({ col: 'description', id: transaction.id || null })}
        onMouseLeave={() => setHoveredCell({ col: '', id: null })}
      >
        {isEditingDescription ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveDescription()}
              autoFocus
            />
            <button
              onClick={handleSaveDescription}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancelDescription}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-sm flex-1">{transaction.description}</span>
            {hoveredCell.col === 'description' && hoveredCell.id === transaction.id && (
              <button
                onClick={() => setIsEditingDescription(true)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-opacity"
                title="Edit description"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </td>
      {/* Category cell */}
      <td
        className="border border-gray-300 px-4 py-2 relative"
        onMouseEnter={() => setHoveredCell({ col: 'category', id: transaction.id || null })}
        onMouseLeave={() => setHoveredCell({ col: '', id: null })}
      >
        {isEditingCategory ? (
          <div className="flex items-center gap-2">
            {!isAddingCategory ? (
              <>
                <select
                  value={editCategory}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingCategory(true);
                    } else {
                      setEditCategory(e.target.value);
                    }
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Category</option>
                </select>
                <button
                  onClick={handleSaveCategory}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancelCategory}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                  title="Add category"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory('');
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex-1 ${
                transaction.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {transaction.category || 'Uncategorized'}
            </span>
            {hoveredCell.col === 'category' && hoveredCell.id === transaction.id && (
              <button
                onClick={() => setIsEditingCategory(true)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-opacity"
                title="Edit category"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </td>
      {/* Amount cell */}
      <td className="border border-gray-300 px-4 py-2 text-right">
        <span
          className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {formatAmount(transaction.amount)}
        </span>
      </td>
      {/* Delete cell */}
      <td
        className="border border-gray-300 px-4 py-2 text-center relative"
        onMouseEnter={() => setHoveredCell({ col: 'delete', id: transaction.id || null })}
        onMouseLeave={() => setHoveredCell({ col: '', id: null })}
      >
        <div className="inline-block">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete transaction"
            style={{
              visibility:
                hoveredCell.col === 'delete' && hoveredCell.id === transaction.id
                  ? 'visible'
                  : 'hidden',
            }}
          >
            <Trash2 size={16} />
          </button>
          {showDeleteConfirm && (
            <div className="absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 bg-white border border-red-200 rounded-lg shadow-lg p-4 w-56">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to delete this transaction?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                "{transaction.description}" - {formatAmount(transaction.amount)}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export const TransactionList: React.FC<Props> = ({
  transactions: propTransactions,
  categories: propCategories = [],
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ col: string; id: string | null }>({
    col: '',
    id: null,
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Always sort and page from props
  const sortedTransactions = [...propTransactions].sort((a, b) => {
    return new Date(b.transactionDateTime).getTime() - new Date(a.transactionDateTime).getTime();
  });
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const pagedTransactions = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(id, updates);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
  };

  if (propTransactions.length === 0) {
    return (
      <div className="my-6 mx-4 p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <div className="mb-6">
          <Upload className="mx-auto h-16 w-16 text-gray-400" />
        </div>
        <p className="text-sm mb-2">No transactions yet. Start by adding one!</p>
      </div>
    );
  }

  return (
    <div className="w-[70%] mx-auto">
      <table className="w-full border-collapse border border-gray-300 text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          {pagedTransactions.map((t) => (
            <TransactionRow
              key={t.id || `${t.transactionDateTime}-${t.amount}`}
              transaction={t}
              categories={propCategories}
              onUpdate={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
              hoveredCell={hoveredCell}
              setHoveredCell={setHoveredCell}
            />
          ))}
        </tbody>
      </table>
      {/* Paging controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
