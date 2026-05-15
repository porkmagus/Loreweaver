import { useState } from 'react';
import { useApi, apiPost } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Globe, Plus, ChevronLeft, Users, BookOpen, Clock } from 'lucide-react';
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
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Worlds</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your story universes</p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)}>
          <Plus className="mr-2 h-4 w-4" />
          New World
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create World</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input name="name" placeholder="World name" required />
              <Textarea name="description" placeholder="Description" rows={3} />
              <Input name="genre" placeholder="Genre (e.g., fantasy, sci-fi)" />
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
        {worlds?.map((world) => (
          <Link
            key={world.id}
            to={`/worlds?id=${world.id}`}
            className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {world.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {world.description ?? 'No description'}
                </p>
                {world.genre && (
                  <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {world.genre}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {worlds?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Globe className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No worlds yet. Create your first universe.</p>
        </div>
      )}
    </div>
  );
}

function WorldDetail({ worldId }: { worldId: number }) {
  const { data: world, loading, error } = useApi<World>(`/worlds/${worldId}`);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/worlds">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{world?.name ?? 'World'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {world?.genre ?? 'No genre set'}
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

      {world && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {world.description ?? 'No description'}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to={`/characters?worldId=${worldId}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900"
            >
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold">Characters</p>
                <p className="text-xs text-slate-500">View characters</p>
              </div>
            </Link>
            <Link
              to={`/lore?worldId=${worldId}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900"
            >
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold">Lore</p>
                <p className="text-xs text-slate-500">View lore entries</p>
              </div>
            </Link>
            <Link
              to={`/timeline?worldId=${worldId}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900"
            >
              <Clock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="text-sm font-semibold">Timeline</p>
                <p className="text-xs text-slate-500">View events</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
