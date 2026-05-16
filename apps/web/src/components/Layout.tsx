import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  Users,
  BookOpen,
  Clock,
  MessageSquare,
  Menu,
  X,
  Moon,
  Sun,
  Activity,
  WifiOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import type { HealthResponse } from '@loreweaver/shared';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worlds', label: 'Worlds', icon: Globe },
  { to: '/characters', label: 'Characters', icon: Users },
  { to: '/lore', label: 'Lore', icon: BookOpen },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const location = useLocation();
  const { data: health, error: healthError } = useApi<HealthResponse>('/health');

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transform border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Loreweaver</span>
          </Link>
          <div className="flex items-center gap-2">
            {health ? (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  health.aiMode === 'live'
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                )}>
                  <Activity className="h-3 w-3" />
                  {health.aiMode === 'live' ? 'Live' : 'Simulated'}
                </div>
                {health.qdrantConnected && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">Qdrant</span>
                )}
              </div>
            ) : healthError ? (
              <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                <WifiOff className="h-3 w-3" />
                Offline
              </div>
            ) : null}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            onClick={() => setDark(!dark)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Loreweaver</span>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
