import { useEffect, useState, useMemo } from "react";
import type { Transaction } from "../models/transaction";
import { getTransactions } from "../api/transactions";
import { TransactionList } from "../components/TransactionList";

type Props = {
  userId: string;
};

export function Transactions({ userId }: Readonly<Props>) {
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

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      return (
        new Date(b.transactionDateTime).getTime() -
        new Date(a.transactionDateTime).getTime()
      );
    });
  }, [transactions]);

  return (
    <div>
      <TransactionList transactions={sortedTransactions} />
    </div>
  );
}
