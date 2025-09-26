import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthForm } from './AuthForm';
import { LoggedInView } from './LoggedInView';
import { setupUserProfile } from '../api/user';
import { useAuth } from '../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  // TODO: Add forget password functionality
  const handleAuth = async () => {
    setError(null);
    try {
      if (isRegister) {
        const createdUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const createdUser = createdUserCredential.user;
        await setupUserProfile({
          uid: createdUser.uid,
          email: createdUser.email ?? '',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (user) {
    return <LoggedInView user={user} onLogout={handleLogout} />;
  }

  return (
    <AuthForm
      email={email}
      password={password}
      isRegister={isRegister}
      error={error}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleAuth}
      onToggleMode={() => setIsRegister((prev) => !prev)}
    />
  );
};
