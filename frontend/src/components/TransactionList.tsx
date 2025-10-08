import React, { useEffect, useState } from 'react';
import TransactionRow from './TransactionRow';
import type { Transaction } from '../models/transaction';
import { updateTransaction } from '../api/transactions';
import { getCategories, addCategory } from '../api/categories';

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

  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        if (!Array.isArray(fetchedCategories)) {
          console.error('Fetched categories are not an array:', fetchedCategories);
          return;
        }

        const validCategories = fetchedCategories.map((cat) => {
          if (typeof cat === 'string') {
            return { name: cat };
          } else if (cat && typeof cat === 'object' && 'name' in cat) {
            return cat;
          } else {
            console.warn('Invalid category format:', cat);
            return { name: JSON.stringify(cat) };
          }
        });
        setCategories(validCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleMenuToggle = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const handleEdit = (transaction: Transaction) => {
    const category = typeof transaction.category === 'string' ? transaction.category : '';
    setTransactionToEdit({ ...transaction, category });
    setIsEditModalOpen(true);
  };

  const renderCategoryOptions = () => {
    return categories.map((category, index) => (
      <option key={`${category.name}-${index}`} value={category.name}>
        {category.name}
      </option>
    ));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsAddingCategory(true);
    try {
      setCategories((prev) => [...prev, { name: newCategory }]);
      await addCategory(newCategory);
      setNewCategory('');
    } catch (err) {
      console.error('Failed to add category:', err);
      setCategories((prev) => prev.filter((cat) => cat.name !== newCategory));
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!transactionToEdit) return;
    try {
      await updateTransaction(transactionToEdit);
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
                <select
                  id="category"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  value={transactionToEdit.category}
                  onChange={(e) =>
                    setTransactionToEdit({ ...transactionToEdit, category: e.target.value })
                  }
                >
                  {renderCategoryOptions()}
                  <option value="">Add New Category</option>
                </select>
                {transactionToEdit.category === '' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="New Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={isAddingCategory}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAddingCategory ? 'Adding...' : 'Add Category'}
                    </button>
                  </div>
                )}
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
