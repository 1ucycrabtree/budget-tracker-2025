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


export async function importTransactions(file: File, userId: string): Promise<Transaction[]> {
  const formData = new FormData();
  formData.append("file", file);


  const res = await fetch(`${API_BASE}/transactions/import`, {
    method: "POST",
    headers: {
      "User-Id": userId,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to import transactions: ${await res.text()}`);
  }

  return res.json();
}