import { getAuth } from 'firebase/auth';

export async function getCategories(): Promise<string[]> {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();

    const response = await fetch('/api/categories', {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function addCategory(category: string): Promise<void> {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name: category }),
    });

    if (!response.ok) {
      throw new Error('Failed to add category');
    }
  } catch (error) {
    console.error('Error adding category:', error);
  }
}
