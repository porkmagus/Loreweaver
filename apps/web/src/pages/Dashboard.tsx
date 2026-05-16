import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GenerateWorldModal } from '@/components/GenerateWorldModal';
import {
  Globe,
  Users,
  BookOpen,
  Clock,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HealthResponse, World, Character, LoreEntry, TimelineEvent } from '@loreweaver/shared';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { data: health, loading: hLoading, error: hError, refetch: refetchHealth } = useApi<HealthResponse>('/health');
  const { data: worlds, loading: wLoading, refetch: refetchWorlds } = useApi<World[]>('/worlds');
  const firstWorldId = worlds?.[0]?.id ?? 1;
  const { data: characters, loading: cLoading } = useApi<Character[]>(`/worlds/${firstWorldId}/characters`);
  const { data: lore, loading: lLoading } = useApi<LoreEntry[]>(`/worlds/${firstWorldId}/lore`);
  const { data: events, loading: eLoading } = useApi<TimelineEvent[]>(`/worlds/${firstWorldId}/timeline`);

  const anyLoading = hLoading || wLoading || cLoading || lLoading || eLoading;

  const handleReset = async () => {
    if (!confirm('Reset all data? This wipes worlds, characters, lore, timeline, and chat history.')) return;
    setResetting(true);
    try {
      await fetch((import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '') + '/api/dev/reset', { method: 'POST' });
      refetchHealth();
      refetchWorlds();
      alert('Data reset. Reloading...');
      window.location.reload();
    } catch {
      alert('Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const stats = [
    {
      label: 'Worlds',
      count: worlds?.length ?? 0,
      icon: Globe,
      to: '/worlds',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Characters',
      count: characters?.length ?? 0,
      icon: Users,
      to: '/characters',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      label: 'Lore Entries',
      count: lore?.length ?? 0,
      icon: BookOpen,
      to: '/lore',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Timeline Events',
      count: events?.length ?? 0,
      icon: Clock,
      to: '/timeline',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of your Loreweaver universe</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate World
          </Button>
          {health && health.aiMode !== 'live' && (
            <Button variant="ghost" disabled={resetting} onClick={handleReset} title="Reset all data">
              {resetting ? 'Resetting…' : 'Reset Data'}
            </Button>
          )}
          {health && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Activity className="h-4 w-4" />
              API Healthy
            </div>
          )}
        </div>
      </div>

      {hError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          API unavailable: {hError}
        </div>
      )}

      {anyLoading && !worlds && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-lg p-2", stat.bg)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <span className="text-2xl font-bold">{stat.count}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.to}
              to={stat.to}
              className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
            >
              <div className={cn("rounded-lg p-2.5", stat.bg)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage {stat.label.toLowerCase()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {modalOpen && <GenerateWorldModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
