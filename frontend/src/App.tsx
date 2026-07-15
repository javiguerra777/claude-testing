import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';

function AppShell() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-2xl bg-white p-8 text-center shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user.email}</h1>
        <p className="mt-2 text-slate-500">You're logged in. The dashboard is coming soon.</p>
        <button
          onClick={logout}
          className="mt-6 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Log out
        </button>
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
