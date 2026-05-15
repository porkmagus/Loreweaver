import { useState } from 'react';
import { useApi, apiPost } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Users, Plus, ChevronLeft, Clock, Heart } from 'lucide-react';
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
        isPlayer: fd.get('isPlayer') === 'on',
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
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Characters</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {worldId ? 'Characters in this world' : 'Select a world to view characters'}
          </p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} disabled={!worldId}>
          <Plus className="mr-2 h-4 w-4" />
          New Character
        </Button>
      </div>

      {!worldId && (
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select a World
            </label>
            <select
              value={selectedWorld}
              onChange={(e) => setSelectedWorld(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">Choose a world…</option>
              {worlds?.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
            {selectedWorld && (
              <Link to={`/characters?worldId=${selectedWorld}`} className="mt-3 inline-block">
                <Button variant="primary" size="sm">View Characters</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {formOpen && worldId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Character</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="hidden" name="worldId" value={worldId} />
              <Input name="name" placeholder="Character name" required />
              <Textarea name="description" placeholder="Description" rows={2} />
              <Input name="personality" placeholder="Personality traits" />
              <Input name="role" placeholder="Role in story" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPlayer" className="rounded" />
                Player character
              </label>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">
                  {submitting ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
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

      <div className="grid gap-3 sm:grid-cols-2">
        {characters?.map((char) => (
          <Link
            key={char.id}
            to={`/characters?id=${char.id}`}
            className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/30">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {char.name}
                </h3>
                {char.role && (
                  <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {char.role}
                  </span>
                )}
                {char.isPlayer && (
                  <span className="ml-1 mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Player
                  </span>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {char.description ?? 'No description'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {characters?.length === 0 && !loading && worldId && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No characters in this world yet.</p>
        </div>
      )}
    </div>
  );
}

function CharacterDetail({ characterId }: { characterId: number }) {
  const { data: char, loading, error } = useApi<Character>(`/characters/${characterId}`);
  const { data: timeline } = useApi<TimelineEvent[]>(`/characters/${characterId}/timeline`);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/characters">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{char?.name ?? 'Character'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {char?.role ?? 'No role'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      {char && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              {char.personality && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Personality
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{char.personality}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Description
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{char.description ?? 'No description'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeline && timeline.length > 0 ? (
                timeline.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 rounded-md border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{ev.description ?? ''}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ev.happenedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No timeline events yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
