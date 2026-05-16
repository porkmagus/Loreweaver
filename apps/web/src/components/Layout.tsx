import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  Users,
  BookOpen,
  Clock,
  MessageSquare,
  Settings as SettingsIcon,
  Menu,
  X,
  Moon,
  Sun,
  WifiOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import type { HealthResponse } from '@loreweaver/shared';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/worlds', label: 'Worlds', icon: Globe },
  { to: '/characters', label: 'Characters', icon: Users },
  { to: '/lore', label: 'Lore', icon: BookOpen },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('loreweaver-theme') !== 'light';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('loreweaver-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('loreweaver-theme', 'light');
    }
  }, [dark]);

  const location = useLocation();
  const { data: health, error: healthError } = useApi<HealthResponse>('/health');

  return (
    <div className="flex h-screen w-full bg-void text-parchment">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transform border-r border-ridge bg-depth transition-transform duration-300 ease-archive lg:static lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-ridge px-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-card border border-gold/30 bg-gold/5">
              <BookOpen className="h-4 w-4 text-gold" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-h3 font-medium leading-none text-parchment group-hover:text-gold transition-colors duration-archive">Loreweaver</span>
              <span className="text-tiny text-dust tracking-wider">ARCHIVE</span>
            </div>
          </Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="text-dust hover:text-parchment lg:hidden transition-colors">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Status */}
        <div className="border-b border-ridge px-5 py-3">
          {health ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "relative flex h-2 w-2",
                  health.aiMode === 'live' ? "" : "opacity-50"
                )}>
                  <span className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-40",
                    health.aiMode === 'live' ? "bg-gold" : "bg-dust"
                  )} />
                  <span className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    health.aiMode === 'live' ? "bg-gold" : "bg-dust"
                  )} />
                </span>
                <span className={cn(
                  "text-tiny font-medium tracking-wide",
                  health.aiMode === 'live' ? "text-gold" : "text-dust"
                )}>
                  {health.aiMode === 'live' ? 'LIVE' : 'ARCHIVE'}
                </span>
              </div>
              {health.qdrantConnected && (
                <span className="text-tiny text-dust tracking-wide">QDRANT</span>
              )}
              {health.provider && (
                <span className="text-tiny text-dust tracking-wide">{health.provider.toUpperCase()}</span>
              )}
              {health.chatModel && (
                <span className="text-tiny text-dust tracking-wide truncate max-w-[6rem]" title={health.chatModel}>{health.chatModel.split('/').pop() ?? health.chatModel}</span>
              )}
            </div>
          ) : healthError ? (
            <div className="flex items-center gap-2 text-fear">
              <WifiOff className="h-3 w-3" strokeWidth={1.5} />
              <span className="text-tiny tracking-wide">OFFLINE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Spinner className="h-3 w-3" />
              <span className="text-tiny text-dust tracking-wide">CONNECTING</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-card px-3 py-2.5 text-small font-medium transition-all duration-archive",
                  active
                    ? "border-l-2 border-gold bg-gold/5 text-gold"
                    : "border-l-2 border-transparent text-ash hover:text-parchment hover:bg-surface/60"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-ridge p-3">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-small text-ash transition-all duration-archive hover:text-parchment hover:bg-surface/60"
          >
            {dark ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
            <span>{dark ? 'Light Archive' : 'Dark Archive'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 items-center gap-3 border-b border-ridge bg-void px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-ash hover:text-parchment transition-colors">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <span className="font-serif text-h3 text-parchment">Loreweaver</span>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-5xl h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
