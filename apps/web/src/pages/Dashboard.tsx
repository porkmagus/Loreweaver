import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { GenerateWorldModal } from '@/components/GenerateWorldModal';
import { PortraitFrame, WorldBannerFrame } from '@/components/VisualAssetFrame';
import { cn } from '@/lib/utils';
import { getCharacterPortrait, getWorldBanner } from '@/lib/visualAssets';
import { getActiveWorldId, getActiveCharacterId, setActiveWorldId, setActiveCharacterId } from '@/lib/activeState';
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

interface WorldStats {
  worldId: number;
  characters: number;
  loreEntries: number;
  timelineEvents: number;
  chatSessions: number;
}

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { data: health, loading: hLoading, error: hError, refetch: refetchHealth } = useApi<HealthResponse>('/health');
  const { data: worlds, loading: wLoading, refetch: refetchWorlds } = useApi<World[]>('/worlds');

  const activeWorldId = worlds
    ? (worlds.find((w) => w.id === getActiveWorldId())?.id ?? worlds[0]?.id)
    : null;
  const activeWorld = worlds?.find((w) => w.id === activeWorldId) ?? worlds?.[0];

  const charactersUrl = activeWorldId ? `/worlds/${activeWorldId}/characters` : null;
  const { data: characters, loading: cLoading } = useApi<Character[]>(charactersUrl);
  const loreUrl = activeWorldId ? `/worlds/${activeWorldId}/lore` : null;
  const { data: lore, loading: lLoading } = useApi<LoreEntry[]>(loreUrl);
  const eventsUrl = activeWorldId ? `/worlds/${activeWorldId}/timeline` : null;
  const { data: events, loading: eLoading } = useApi<TimelineEvent[]>(eventsUrl);
  const statsUrl = activeWorldId ? `/worlds/${activeWorldId}/stats` : null;
  const { data: stats, loading: sLoading } = useApi<WorldStats>(statsUrl);

  const activeCharacter = characters?.find((c) => c.id === getActiveCharacterId()) ?? characters?.[0];

  useEffect(() => {
    if (activeWorldId) setActiveWorldId(activeWorldId);
    if (activeCharacter) setActiveCharacterId(activeCharacter.id);
  }, [activeWorldId, activeCharacter]);

  const anyLoading = hLoading || wLoading || cLoading || lLoading || eLoading || sLoading;
  const world = activeWorld;

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
        <WorldBannerFrame
          asset={getWorldBanner(world.metadata)}
          title={world.name}
          subtitle={world.description}
          className="min-h-[280px]"
        />
      ) : null}

      {world && (
        <div className="-mt-section flex flex-wrap items-center gap-6 px-inner">
          {world.genre && (
            <span className="rounded-card border border-ridge bg-depth px-3 py-1 text-tiny uppercase tracking-wider text-dust">
              {world.genre}
            </span>
          )}
          <Link to={activeWorld ? `/worlds?id=${activeWorld.id}` : '/worlds'} className="group flex items-center gap-1.5 text-small text-gold hover:text-gold-dim transition-colors">
            <span>Explore World</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Link>
          <Link to={activeCharacter ? `/chat?worldId=${activeCharacter.worldId}&characterId=${activeCharacter.id}` : (activeWorld ? `/characters?worldId=${activeWorld.id}` : '/characters')} className="group flex items-center gap-1.5 text-small text-gold hover:text-gold-dim transition-colors">
            <span>Converse</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
          </Link>
        </div>
      )}

      {/* Chronicle Grid */}
      {world && (
        <div className="grid gap-card sm:grid-cols-2 lg:grid-cols-4">
          <ChronicleTile
            icon={Users}
            label="Characters"
            count={characters?.length ?? 0}
            description="Active personas"
            to={activeWorld ? `/characters?worldId=${activeWorld.id}` : '/characters'}
            color="text-sage"
          />
          <ChronicleTile
            icon={BookOpen}
            label="Lore Entries"
            count={lore?.length ?? 0}
            description="Codex records"
            to={activeWorld ? `/lore?worldId=${activeWorld.id}` : '/lore'}
            color="text-gold"
          />
          <ChronicleTile
            icon={Clock}
            label="Timeline Events"
            count={events?.length ?? 0}
            description="Chronicle entries"
            to={activeWorld ? `/timeline?worldId=${activeWorld.id}` : '/timeline'}
            color="text-ember"
          />
          <ChronicleTile
            icon={Scroll}
            label="Chat Sessions"
            count={stats?.chatSessions ?? 0}
            description="Active dialogues"
            to={activeCharacter ? `/chat?worldId=${activeCharacter.worldId}&characterId=${activeCharacter.id}` : (activeWorld ? `/characters?worldId=${activeWorld.id}` : '/chat')}
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
                className="group overflow-hidden rounded-card border border-ridge bg-surface bg-surface-grad transition-all duration-archive hover:border-gold/30 hover:bg-gold/5"
              >
                <PortraitFrame
                  asset={getCharacterPortrait(char.metadata)}
                  name={char.name}
                  role={char.role}
                  className="aspect-[4/3] border-0"
                />
                <div className="space-y-3 p-5">
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
