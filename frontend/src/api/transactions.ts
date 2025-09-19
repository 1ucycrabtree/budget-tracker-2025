import type { Transaction } from "../models/transaction";

// temporary API base URL
const API_BASE = "http://localhost:8080";

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { "User-Id": userId },
    });
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return [];
  }
}

export async function addTransaction(transaction: Transaction, userId: string) {
  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Id": userId,
      },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (err) {
    console.error("Failed to add transaction:", err);
    return null;
  }
}
