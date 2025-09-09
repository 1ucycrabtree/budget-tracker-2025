import React, { useState } from "react";
import type { Transaction } from "../models/transaction";

interface Props {
  onAdd: (t: Transaction) => void;
}

export const TransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      description,
      amount,
      category: "",
      type: amount > 0 ? "Credit" : "Debit",
      transactionDateTime: new Date().toISOString(),
    });
    setDescription("");
    setAmount(0);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button type="submit">Add</button>
    </form>
  );
};
