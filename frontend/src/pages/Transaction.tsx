import { useEffect, useState } from 'react';
import type { Transaction } from '../models/transaction';
import { getTransactions } from '../api/transactions';
import { TransactionList } from '../components/TransactionList';
import ImportTransactions from '../components/ImportTransactions';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      const data = await getTransactions();
      if (isMounted) setTransactions(Array.isArray(data) ? data : []);
    };
    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshTransactions = async () => {
    const data = await getTransactions();
    setTransactions(Array.isArray(data) ? data : []);
  };

  return (
    <div>
      <ImportTransactions onImportComplete={refreshTransactions} />
      <TransactionList transactions={transactions} refreshTransactions={refreshTransactions} />
    </div>
  );
}
