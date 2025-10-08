import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { Transaction } from '../models/transaction';
import { formatDate, formatAmount } from '../utils/format';

interface Props {
  transactions: Transaction[];
}

const TransactionRow: React.FC<{
  transaction: Transaction;
}> = ({ transaction }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-gray-200 py-2 px-2 hover:bg-gray-50">
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
      <div className="col-span-1 text-center ">
        <button className="text-gray-400 hover:text-gray-800">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export const TransactionList: React.FC<Props> = ({ transactions: propTransactions }) => {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // !In future will sort in backend and just fetch 15 at a time
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
      <div className="grid grid-cols-12 gap-2 border-b border-gray-200 pb-2 px-1 mb-1 capitalize font-semibold text-gray-700">
        <div className="col-span-2">Date</div>
        <div className="col-span-4">Description</div>
        <div className="col-span-3">Category</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>

      <div>
        {pagedTransactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} />
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 mt-4">
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
