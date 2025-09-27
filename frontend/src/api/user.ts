export async function setupUserProfile(user: { uid: string; email: string }) {
  try {
    const response = await fetch(`/setupUserProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to set up user profile');
    }
    console.log('User profile and categories seeded via backend');
  } catch (error) {
    console.error('Error seeding user profile:', error);
  }
}
