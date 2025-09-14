import { Transactions } from "./pages/Transaction";
import { useAuth } from "./context/AuthContext";
import { AuthButtons } from "./components/AuthButtons";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-extrabold uppercase mb-4 text-center">
        Budget Tracker
      </h1>

      <AuthButtons />

      {user && <Transactions userId={user.uid} />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
