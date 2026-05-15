import { useState } from 'react';
import { useApi, apiPost } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Clock, Plus, ChevronLeft, CalendarDays } from 'lucide-react';
import type { TimelineEvent, Character, World } from '@loreweaver/shared';
import { Link, useSearchParams } from 'react-router-dom';

export function Timeline() {
  const [params] = useSearchParams();
  const viewId = params.get('id');

  if (viewId) {
    return <TimelineDetail eventId={Number(viewId)} />;
  }

  return <TimelineList />;
}

function TimelineList() {
  const [searchParams] = useSearchParams();
  const worldId = searchParams.get('worldId');
  const characterId = searchParams.get('characterId');

  let url = '/timeline';
  if (characterId) url = `/characters/${characterId}/timeline`;

  const { data: events, loading, error, refetch } = useApi<TimelineEvent[]>(url);
  const { data: worlds } = useApi<World[]>('/worlds');
  const { data: characters } = useApi<Character[]>('/worlds/1/characters');
  const [selectedWorld, setSelectedWorld] = useState<string>(worldId ?? '');
  const [selectedChar, setSelectedChar] = useState<string>(characterId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost<TimelineEvent>('/timeline', {
        characterId: fd.get('characterId') ? Number(fd.get('characterId')) : null,
        title: fd.get('title'),
        description: fd.get('description') || undefined,
        eventType: fd.get('eventType'),
        happenedAt: fd.get('happenedAt'),
        significance: fd.get('significance') ? Number(fd.get('significance')) : null,
      });
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {characterId ? 'Character timeline' : worldId ? 'World timeline' : 'All events'}
          </p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)}>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      {!characterId && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by World
              </label>
              <select
                value={selectedWorld}
                onChange={(e) => setSelectedWorld(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="">All worlds</option>
                {worlds?.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Character
              </label>
              <select
                value={selectedChar}
                onChange={(e) => setSelectedChar(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="">All characters</option>
                {characters?.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {selectedWorld && (
                <Link to={`/timeline?worldId=${selectedWorld}`}>
                  <Button variant="primary" size="sm">Apply</Button>
                </Link>
              )}
              {selectedChar && (
                <Link to={`/timeline?characterId=${selectedChar}`}>
                  <Button variant="primary" size="sm">Apply Char</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {formOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create Timeline Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input name="title" placeholder="Event title" required />
              <Textarea name="description" placeholder="Description" rows={2} />
              <Input name="characterId" placeholder="Character ID" required />
              <Input name="eventType" placeholder="Event type (e.g. battle, meeting)" required />
              <Input name="happenedAt" type="datetime-local" required />
              <Input name="significance" type="number" placeholder="Significance (1-10)" min={1} max={10} />
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

      <div className="space-y-3">
        {events?.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col items-center gap-1 pt-1">
              <CalendarDays className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {new Date(ev.happenedAt).getFullYear()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {ev.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {new Date(ev.happenedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {ev.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {ev.description}
                </p>
              )}
              {ev.significance > 0 && (
                <span className="mt-2 inline-block rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  Significance {ev.significance}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {events?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Clock className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No timeline events yet.</p>
        </div>
      )}
    </div>
  );
}

function TimelineDetail({ eventId }: { eventId: number }) {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/timeline">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Event Detail</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">ID: {eventId}</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Event detail view not yet implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
