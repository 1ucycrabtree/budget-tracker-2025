import React from 'react';

interface Props {
  email: string;
  password: string;
  isRegister: boolean;
  error: string | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
}

export const AuthForm: React.FC<Props> = ({
  email,
  password,
  isRegister,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}) => (
  <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-xl shadow-lg bg-white text-center">
    <input
      className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
      value={email}
      onChange={onEmailChange}
      placeholder="Email"
      type="email"
      autoComplete="email"
    />
    <input
      className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
      type="password"
      value={password}
      onChange={onPasswordChange}
      placeholder="Password"
      autoComplete="current-password"
    />
    {error && <div className="text-red-500 mb-3">{error}</div>}
    <button
      className="w-full py-2 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition"
      onClick={onSubmit}
    >
      {isRegister ? 'Register' : 'Log In'}
    </button>
    <button
      className="w-full py-2 text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
      onClick={onToggleMode}
    >
      {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register"}
    </button>
  </div>
);
