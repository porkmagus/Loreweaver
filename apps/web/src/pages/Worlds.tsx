import { useState } from 'react';
import { useApi, apiPost, apiPatch, apiDelete } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { GenerateWorldModal } from '@/components/GenerateWorldModal';
import { WorldBannerFrame } from '@/components/VisualAssetFrame';
import { getWorldBanner } from '@/lib/visualAssets';
import {
  Globe, Plus, ChevronLeft, Users, BookOpen, Clock, Pencil, Trash2, Sparkles,
  ArrowRight
} from 'lucide-react';
import type { World } from '@loreweaver/shared';
import { Link, useSearchParams } from 'react-router-dom';

export function Worlds() {
  const [params] = useSearchParams();
  const viewId = params.get('id');

  if (viewId) {
    return <WorldDetail worldId={Number(viewId)} />;
  }

  return <WorldList />;
}

function WorldList() {
  const { data: worlds, loading, error, refetch } = useApi<World[]>('/worlds');
  const [formOpen, setFormOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost<World>('/worlds', {
        name: fd.get('name'),
        description: fd.get('description') || undefined,
        genre: fd.get('genre') || undefined,
      });
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create world');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label mb-1">REALMS</p>
          <h1 className="font-serif text-display text-parchment">Worlds</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Generate
          </Button>
          <Button onClick={() => setFormOpen(!formOpen)} variant="primary">
            <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
            New World
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      {formOpen && (
        <Card>
          <CardHeader><CardTitle>Forge New Realm</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input name="name" placeholder="World name" required />
              <Textarea name="description" placeholder="Description…" rows={3} />
              <Input name="genre" placeholder="Genre (e.g., fantasy, sci-fi)" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Forging…' : 'Forge'}</Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="grid gap-card sm:grid-cols-2 lg:grid-cols-3">
        {worlds?.map((world) => (
          <Link
            key={world.id}
            to={`/worlds?id=${world.id}`}
            className="group overflow-hidden rounded-card border border-ridge bg-surface bg-surface-grad transition-all duration-archive hover:border-gold/20"
          >
            <WorldBannerFrame
              asset={getWorldBanner(world.metadata)}
              title={world.name}
              subtitle={world.genre}
              className="min-h-[190px] border-0"
            />
            <div className="space-y-4 p-5">
              {world.description && (
                <p className="text-small text-ash line-clamp-2 leading-relaxed">
                  {world.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-small text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {worlds?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-dust">
          <Globe className="h-10 w-10 opacity-20" strokeWidth={1.5} />
          <div className="text-center space-y-1">
            <p className="text-body">No realms exist yet.</p>
            <p className="text-small">Forge or generate your first world.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} variant="primary">
            <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Generate World
          </Button>
        </div>
      )}

      {modalOpen && <GenerateWorldModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function WorldDetail({ worldId }: { worldId: number }) {
  const { data: world, loading, error, refetch } = useApi<World>(`/worlds/${worldId}`);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPatch<World>(`/worlds/${worldId}`, {
        name: fd.get('name') || undefined,
        description: fd.get('description') || undefined,
        genre: fd.get('genre') || undefined,
      });
      setEditing(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-section">
      <div className="flex items-center gap-3">
        <Link to="/worlds">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-label">REALM</p>
          <h1 className="font-serif text-display text-parchment">{world?.name ?? 'World'}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} disabled={!world}>
          <Pencil className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={async () => {
          if (!confirm('Erase this world and all its contents?')) return;
          try { await apiDelete(`/worlds/${worldId}`); window.location.href = '/worlds'; } catch {}
        }}>
          <Trash2 className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Erase
        </Button>
      </div>

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      {editing && world && (
        <Card>
          <CardHeader><CardTitle>Edit Realm</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Input name="name" defaultValue={world.name} placeholder="Name" required />
              <Textarea name="description" defaultValue={world.description ?? ''} placeholder="Description" rows={3} />
              <Input name="genre" defaultValue={world.genre ?? ''} placeholder="Genre" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Saving…' : 'Save'}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {world && !editing && (
        <Card className="overflow-hidden">
          <WorldBannerFrame
            asset={getWorldBanner(world.metadata)}
            title={world.name}
            subtitle={world.description}
            className="min-h-[320px] border-0"
          />
          <CardContent className="p-inner space-y-4">
            {world.genre && (
              <span className="text-tiny text-dust uppercase tracking-wider">{world.genre}</span>
            )}
            <div className="flex items-center gap-4 pt-2">
              <Link to={`/characters?worldId=${world.id}`} className="text-small text-gold hover:text-gold-dim transition-colors flex items-center gap-1.5">
                <Users className="h-4 w-4" strokeWidth={1.5} />
                Characters
              </Link>
              <Link to={`/lore?worldId=${world.id}`} className="text-small text-gold hover:text-gold-dim transition-colors flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                Lore
              </Link>
              <Link to={`/timeline?worldId=${world.id}`} className="text-small text-gold hover:text-gold-dim transition-colors flex items-center gap-1.5">
                <Clock className="h-4 w-4" strokeWidth={1.5} />
                Timeline
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
