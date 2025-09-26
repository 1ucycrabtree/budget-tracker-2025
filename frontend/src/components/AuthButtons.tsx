import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export const AuthButtons: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = () => {
    createUserWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message));
  };

  const login = () => {
    signInWithEmailAndPassword(auth, email, password).catch((err) => alert(err.message));
  };

  const logout = () => {
    signOut(auth);
  };

  if (user) {
    return (
      <div>
        <p>Welcome {user.email}</p>
        <button onClick={logout}>Log out</button>
      </div>
    );
  }

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={login}>Log in</button>
      <button onClick={register}>Register</button>
    </div>
  );
};
