import type { Transaction } from "../models/transaction";

const API_BASE = "http://localhost:8080";

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions`, {
    headers: { "User-Id": userId },
  });
  return res.json();
}

export async function addTransaction(transaction: Transaction, userId: string) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Id": userId,
    },
    body: JSON.stringify(transaction),
  });
  return res.json();
}
