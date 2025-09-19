import Transactions from "./pages/Transaction";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="px-4 py-4">
      <h1 className="font-extrabold uppercase mb-4 text-center text-3xl">
        Budget Tracker
      </h1>

      <AuthPage />


      {user && <Transactions userId={user.uid} />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
