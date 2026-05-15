import { useEffect, useState } from 'react';
import type { HealthResponse } from '@loreweaver/shared';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setHealth(data as HealthResponse))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Loreweaver</h1>
      <p className="text-lg text-slate-400 mb-8">
        AI-native persistent storytelling and memory platform
      </p>

      <div className="bg-slate-800 rounded-lg p-6 shadow-lg w-full max-w-md">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
          API Health
        </h2>
        {health ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{health.status}</span>
            </div>
            <div className="text-sm text-slate-400">Version: {health.version}</div>
            <div className="text-sm text-slate-400">
              Timestamp: {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Error: {error}</span>
          </div>
        ) : (
          <div className="text-slate-500">Checking API...</div>
        )}
      </div>
    </div>
  );
}

export default App;
