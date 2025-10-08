import Transactions from './pages/Transaction';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    // TODO: Custom loading component
    return <p>Loading...</p>;
  }

  return (
    <div className="px-4 py-4">
      <h1 className="font-extrabold uppercase mb-4 text-center text-3xl">Budget Tracker</h1>
      <AuthPage />

      {user && <Transactions />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
