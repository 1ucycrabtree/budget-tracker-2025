import { useEffect, useState, useMemo } from "react";
import type { Transaction } from "../models/transaction";
import { getTransactions } from "../api/transactions";
import { TransactionList } from "../components/transactionList";

type Props = {
  userId: string;
};

export function Transactions({ userId }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    getTransactions(userId).then((data) => setTransactions(data));
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
