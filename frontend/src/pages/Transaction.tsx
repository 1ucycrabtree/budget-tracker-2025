import { useEffect, useState } from 'react';
import type { Transaction } from '../models/transaction';
import { getTransactions } from '../api/transactions';
import { TransactionList } from '../components/transactionList';
import ImportTransactions from '../components/ImportTransactions';

type Props = {
  userId: string;
};

export default function Transactions({ userId }: Readonly<Props>) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      const data = await getTransactions(userId);
      if (isMounted) setTransactions(Array.isArray(data) ? data : []);
    };
    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refreshTransactions = async () => {
    const data = await getTransactions(userId);
    setTransactions(Array.isArray(data) ? data : []);
  };

  return (
    <div>
      <ImportTransactions userId={userId} onImportComplete={refreshTransactions} />
      <TransactionList transactions={transactions} />
    </div>
  );
}
