import type { User } from "firebase/auth";
import React from "react";

interface Props {
  user: User;
  onLogout: () => void;
}

export const LoggedInView: React.FC<Props> = ({ user, onLogout }) => (
  <div className="max-w-md mx-auto text-center">
    <h4 className="mb-4">Welcome, {user.email}!</h4>
    <button
      className="w-32 py-1 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition"
      onClick={onLogout}
    >
      Log out
    </button>
  </div>
);
