import type { Transaction } from '../models/transaction';
import { getAuth } from 'firebase/auth';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/transactions`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return (await res.json()) as Transaction[];
  } catch (err) {
    console.error('Failed to fetch transactions:', err);
    return [];
  }
}

export async function addTransaction(transaction: Transaction) {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
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

export async function importTransactions(file: File): Promise<Transaction[]> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const idToken = await user.getIdToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/transactions/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to import transactions: ${await res.text()}`);
  }

  return (await res.json()) as Transaction[];
}
