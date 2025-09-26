import type { Transaction } from '../models/transaction';

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const res = await fetch(`/api/transactions`, {
      headers: { 'User-Id': userId },
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return (await res.json()) as Transaction[];
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    return [];
  }
}

export async function addTransaction(transaction: Transaction, userId: string) {
  try {
    const res = await fetch(`/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Id': userId,
      },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Failed to add transaction:', err);
    return null;
  }
}

export async function importTransactions(file: File, userId: string): Promise<Transaction[]> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/transactions/import`, {
    method: 'POST',
    headers: {
      'User-Id': userId,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to import transactions: ${await res.text()}`);
  }

  return (await res.json()) as Transaction[];
}
