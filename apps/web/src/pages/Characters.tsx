import { useState } from 'react';
import { useApi, apiPost, apiPatch, apiDelete } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Users, Plus, ChevronLeft, Heart, Clock, Pencil, Trash2 } from 'lucide-react';
import type { Character, World, TimelineEvent } from '@loreweaver/shared';
import { Link, useSearchParams } from 'react-router-dom';

export function Characters() {
  const [params] = useSearchParams();
  const viewId = params.get('id');

  if (viewId) {
    return <CharacterDetail characterId={Number(viewId)} />;
  }

  return <CharacterList />;
}

function CharacterList() {
  const [searchParams] = useSearchParams();
  const worldId = searchParams.get('worldId');
  const url = worldId ? `/worlds/${worldId}/characters` : null;
  const { data: characters, loading, error, refetch } = useApi<Character[]>(url);
  const { data: worlds } = useApi<World[]>('/worlds');
  const [selectedWorld, setSelectedWorld] = useState<string>(worldId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost<Character>('/characters', {
        worldId: Number(fd.get('worldId')),
        name: fd.get('name'),
        description: fd.get('description') || undefined,
        personality: fd.get('personality') || undefined,
        role: fd.get('role') || undefined,
      });
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label mb-1">PERSONAS</p>
          <h1 className="font-serif text-display text-parchment">Characters</h1>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} disabled={!worldId} variant="primary">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
          New Character
        </Button>
      </div>

      {!worldId && (
        <Card>
          <CardContent className="p-inner">
            <label className="block text-small font-medium text-ash mb-2">Filter by World</label>
            <div className="relative">
              <select
                value={selectedWorld}
                onChange={(e) => setSelectedWorld(e.target.value)}
                className="h-10 w-full appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
              >
                <option value="" className="bg-depth">All worlds</option>
                {worlds?.map((w) => (
                  <option key={w.id} value={String(w.id)} className="bg-depth">{w.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {selectedWorld && (
              <Link to={`/characters?worldId=${selectedWorld}`} className="mt-3 inline-block">
                <Button variant="primary" size="sm">Apply Filter</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      {formOpen && worldId && (
        <Card>
          <CardHeader><CardTitle>Create Persona</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="hidden" name="worldId" value={worldId} />
              <Input name="name" placeholder="Name" required />
              <Textarea name="description" placeholder="Description" rows={3} />
              <Textarea name="personality" placeholder="Personality" rows={2} />
              <Input name="role" placeholder="Role (e.g., spymaster)" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Creating…' : 'Create'}</Button>
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
        {characters?.map((char) => (
          <Link
            key={char.id}
            to={`/characters?id=${char.id}`}
            className="group rounded-card border border-ridge bg-surface bg-surface-grad p-5 transition-all duration-archive hover:border-gold/20"
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

      {characters?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-dust">
          <Users className="h-10 w-10 opacity-20" strokeWidth={1.5} />
          <div className="text-center space-y-1">
            <p className="text-body">No personas in this realm.</p>
            <p className="text-small">Create the first character.</p>
          </div>
          {worldId && (
            <Button onClick={() => setFormOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
              First Character
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function CharacterDetail({ characterId }: { characterId: number }) {
  const { data: char, loading, error, refetch } = useApi<Character>(`/characters/${characterId}`);
  const { data: timeline } = useApi<TimelineEvent[]>(`/characters/${characterId}/timeline`);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPatch<Character>(`/characters/${characterId}`, {
        name: fd.get('name') || undefined,
        description: fd.get('description') || undefined,
        personality: fd.get('personality') || undefined,
        role: fd.get('role') || undefined,
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
        <Link to="/characters">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-label">PERSONA</p>
          <h1 className="font-serif text-display text-parchment">{char?.name ?? 'Character'}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} disabled={!char}>
          <Pencil className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={async () => {
          if (!confirm('Erase this character?')) return;
          try { await apiDelete(`/characters/${characterId}`); window.location.href = '/characters'; } catch {}
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

      {editing && char && (
        <Card>
          <CardHeader><CardTitle>Edit Persona</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Input name="name" defaultValue={char.name} placeholder="Name" required />
              <Textarea name="description" defaultValue={char.description ?? ''} placeholder="Description" rows={3} />
              <Textarea name="personality" defaultValue={char.personality ?? ''} placeholder="Personality" rows={2} />
              <Input name="role" defaultValue={char.role ?? ''} placeholder="Role" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Saving…' : 'Save'}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {char && !editing && (
        <div className="space-y-section">
          <Card>
            <CardContent className="p-inner space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-card border border-ridge bg-depth shrink-0">
                  <Users className="h-7 w-7 text-ash" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-h1 text-parchment">{char.name}</h2>
                    {char.role && (
                      <span className="rounded-full border border-ridge bg-depth px-3 py-1 text-tiny text-dust uppercase tracking-wider">
                        {char.role}
                      </span>
                    )}
                  </div>
                  {char.personality && (
                    <p className="text-body text-ash italic max-w-2xl leading-relaxed">
                      “{char.personality}”
                    </p>
                  )}
                </div>
              </div>
              {char.description && (
                <p className="text-body text-ash leading-relaxed max-w-2xl">
                  {char.description}
                </p>
              )}
              <div className="flex items-center gap-4 pt-2">
                <Link to={`/chat?worldId=${char.worldId}&characterId=${char.id}`} className="text-small text-gold hover:text-gold-dim transition-colors flex items-center gap-1.5">
                  <Heart className="h-4 w-4" strokeWidth={1.5} />
                  Converse
                </Link>
              </div>
            </CardContent>
          </Card>

          {timeline && timeline.length > 0 && (
            <div className="space-y-4">
              <p className="text-label">CHRONICLE</p>
              <div className="space-y-3">
                {timeline.map((ev) => (
                  <div key={ev.id} className="rounded-card border border-ridge bg-surface bg-surface-grad p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif text-h3 text-parchment">{ev.title}</h3>
                      <span className="text-tiny text-dust">{new Date(ev.happenedAt).toLocaleDateString()}</span>
                    </div>
                    {ev.description && (
                      <p className="text-small text-ash">{ev.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
