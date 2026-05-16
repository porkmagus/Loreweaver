import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { GenerateWorldModal } from '@/components/GenerateWorldModal';
import { cn } from '@/lib/utils';
import {
  Globe,
  Users,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Scroll,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HealthResponse, World, Character, LoreEntry, TimelineEvent } from '@loreweaver/shared';

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
  const world = worlds?.[0];

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

  return (
    <div className="space-y-section">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label mb-1">ARCHIVE OVERVIEW</p>
            <h1 className="font-serif text-display text-parchment">
              {world?.name ?? 'Loreweaver'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Generate World
            </Button>
            {health && health.aiMode !== 'live' && (
              <Button variant="ghost" disabled={resetting} onClick={handleReset}>
                {resetting ? 'Resetting…' : 'Reset Data'}
              </Button>
            )}
          </div>
        </div>

        {hError && (
          <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
            Archive unavailable: {hError}
          </div>
        )}
      </div>

      {/* World Focus */}
      {anyLoading && !world ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      ) : world ? (
        <div className="rounded-card border border-ridge bg-surface bg-surface-grad p-inner">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card border border-gold/20 bg-gold/5">
              <Globe className="h-7 w-7 text-gold" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-h1 text-parchment">{world.name}</h2>
                {world.genre && (
                  <span className="rounded-full border border-ridge bg-depth px-3 py-1 text-tiny text-dust uppercase tracking-wider">
                    {world.genre}
                  </span>
                )}
              </div>
              {world.description && (
                <p className="text-body text-ash leading-relaxed max-w-2xl">
                  {world.description}
                </p>
              )}
              <div className="flex items-center gap-6 pt-2">
                <Link to="/worlds" className="group flex items-center gap-1.5 text-small text-gold hover:text-gold-dim transition-colors">
                  <span>Explore World</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </Link>
                <Link to="/chat" className="group flex items-center gap-1.5 text-small text-gold hover:text-gold-dim transition-colors">
                  <span>Converse</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Chronicle Grid */}
      {world && (
        <div className="grid gap-card sm:grid-cols-2 lg:grid-cols-4">
          <ChronicleTile
            icon={Users}
            label="Characters"
            count={characters?.length ?? 0}
            description="Active personas"
            to="/characters"
            color="text-sage"
          />
          <ChronicleTile
            icon={BookOpen}
            label="Lore Entries"
            count={lore?.length ?? 0}
            description="Codex records"
            to="/lore"
            color="text-gold"
          />
          <ChronicleTile
            icon={Clock}
            label="Timeline Events"
            count={events?.length ?? 0}
            description="Chronicle entries"
            to="/timeline"
            color="text-ember"
          />
          <ChronicleTile
            icon={Scroll}
            label="Chat Sessions"
            count={0}
            description="Active dialogues"
            to="/chat"
            color="text-mist"
          />
        </div>
      )}

      {/* Recent Characters */}
      {characters && characters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-label">KNOWN PERSONAS</p>
            <Link to="/characters" className="text-small text-gold hover:text-gold-dim transition-colors">
              View All
            </Link>
          </div>
          <div className="grid gap-card sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => (
              <Link
                key={char.id}
                to={`/characters?id=${char.id}`}
                className="group rounded-card border border-ridge bg-surface bg-surface-grad p-5 transition-all duration-archive hover:border-gold/30 hover:bg-gold/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-card border border-ridge bg-depth">
                      <Users className="h-4 w-4 text-ash" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-h3 text-parchment truncate group-hover:text-gold transition-colors">
                        {char.name}
                      </h3>
                      {char.role && (
                        <p className="text-tiny text-dust uppercase tracking-wider">{char.role}</p>
                      )}
                    </div>
                  </div>
                  {char.description && (
                    <p className="text-small text-ash line-clamp-2 leading-relaxed">
                      {char.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!anyLoading && !world && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-card border border-ridge bg-surface">
            <Globe className="h-8 w-8 text-dust" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="font-serif text-h1 text-parchment">The Archive Awaits</h2>
            <p className="text-body text-ash max-w-md">
              No worlds exist yet. Describe a realm and Loreweaver will build it — characters, lore, timeline, and all.
            </p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Generate First World
          </Button>
        </div>
      )}

      {modalOpen && <GenerateWorldModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function ChronicleTile({
  icon: Icon,
  label,
  count,
  description,
  to,
  color,
}: {
  icon: typeof Users;
  label: string;
  count: number;
  description: string;
  to: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-card border border-ridge bg-surface bg-surface-grad p-5 transition-all duration-archive hover:border-shingle"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-ridge bg-depth transition-colors", color)}>
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-h2 text-parchment">{count}</span>
          <span className="text-tiny text-dust uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-small text-dust">{description}</p>
      </div>
    </Link>
  );
}
