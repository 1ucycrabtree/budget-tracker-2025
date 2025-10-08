import type { Transaction } from '../models/transaction';
import { getAuth } from 'firebase/auth';

export async function getTransactions(): Promise<Transaction[]> {
  // Comment out mock data when running backend locally
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        id: '1',
        amount: -5510,
        transactionDateTime: '2024-06-01',
        description: 'Groceries',
        category: 'Food',
      },
      {
        id: '2',
        amount: -12000,
        transactionDateTime: '2024-06-03',
        description: 'Yorkshire Water',
        category: 'Bills',
      },
      {
        id: '3',
        amount: -850,
        transactionDateTime: '2024-06-03',
        description: 'Drinks at The Heist',
        category: 'Going Out',
      },

      {
        id: '4',
        amount: 90000,
        transactionDateTime: '2024-06-02',
        description: 'June Paycheck',
        category: 'Income',
      },
    ] as Transaction[];
  }
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

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!res.ok) throw new Error('Network response was not ok');
  } catch (err) {
    console.error('Failed to delete transaction:', err);
  }
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    const res = await fetch(`/api/transactions/${transaction.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Network response was not ok');
  } catch (err) {
    console.error('Failed to update transaction:', err);
  }
}
