import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Dashboard } from '@/pages/Dashboard';
import { Worlds } from '@/pages/Worlds';
import { Characters } from '@/pages/Characters';
import { Lore } from '@/pages/Lore';
import { Timeline } from '@/pages/Timeline';
import { Chat } from '@/pages/Chat';
import { Onboarding } from '@/pages/Onboarding';
import { NotFound } from '@/pages/NotFound';
import { Spinner } from '@/components/ui/Spinner';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '') + '/api';

function useWorldCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/worlds`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json.data ?? [];
      setCount(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    // Poll every 10s to detect world creation from other tabs/sessions
    const id = setInterval(fetchCount, 10_000);
    return () => clearInterval(id);
  }, []);

  return { count, loading, error, refetch: fetchCount };
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/worlds" element={<Worlds />} />
      <Route path="/characters" element={<Characters />} />
      <Route path="/lore" element={<Lore />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { count, loading, error } = useWorldCount();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-void">
        <Spinner />
      </div>
    );
  }

  // If API is unreachable, show onboarding so user isn't stuck on a broken spinner
  if (error) {
    return <Onboarding />;
  }

  if (count === 0) {
    return <Onboarding />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <OnboardingGate>
        <Layout>
          <AppRoutes />
        </Layout>
      </OnboardingGate>
    </ErrorBoundary>
  );
}

export default App;
