import React from "react";
import type { Transaction } from "../models/transaction";
import { formatDate, formatAmount } from "../utils/format";

interface Props {
  transactions: Transaction[];
}

export const TransactionList: React.FC<Props> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm">No transactions yet. Start by adding one!</p>
      </div>
    );
  }

  return (
    <div className="w-[60%] max-w-[960px] mx-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Description
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              Category
            </th>
            <th className="border border-gray-300 px-4 py-2 text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {formatDate(t.transactionDateTime)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {t.description}
              </td>
              <td className="border border-gray-300 px-4 py-2">{t.category}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {formatAmount(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
