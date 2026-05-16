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
  else if (worldId) url = `/worlds/${worldId}/timeline`;

  const { data: events, loading, error, refetch } = useApi<TimelineEvent[]>(url);
  const { data: characters } = useApi<Character[]>('/characters');
  const { data: worlds } = useApi<World[]>('/worlds');
  const [selectedCharacter, setSelectedCharacter] = useState<string>(characterId ?? '');
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
      await apiPost<TimelineEvent>('/timeline', {
        characterId: Number(fd.get('characterId')),
        title: fd.get('title'),
        description: fd.get('description') || undefined,
        eventType: fd.get('eventType') || 'milestone',
        significance: Number(fd.get('significance') || 1),
        happenedAt: fd.get('happenedAt') ? new Date(fd.get('happenedAt') as string).toISOString() : new Date().toISOString(),
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
    <div className="space-y-section">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label mb-1">CHRONICLE</p>
          <h1 className="font-serif text-display text-parchment">Timeline</h1>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} variant="primary">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Record Event
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={selectedWorld}
            onChange={(e) => setSelectedWorld(e.target.value)}
            className="h-10 appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
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
        <div className="relative">
          <select
            value={selectedCharacter}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="h-10 appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
          >
            <option value="" className="bg-depth">All characters</option>
            {characters?.map((c) => (
              <option key={c.id} value={String(c.id)} className="bg-depth">{c.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        {(selectedWorld || selectedCharacter) && (
          <Link to={`/timeline?${selectedWorld ? `worldId=${selectedWorld}` : ''}${selectedCharacter ? `characterId=${selectedCharacter}` : ''}`}>
            <Button variant="primary" size="sm">Apply</Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      {formOpen && (
        <Card>
          <CardHeader><CardTitle>Record Chronicle Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="relative">
                <select name="characterId" required className="h-10 w-full appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none">
                  <option value="" className="bg-depth">Select character</option>
                  {characters?.map((c) => (
                    <option key={c.id} value={c.id} className="bg-depth">{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <Input name="title" placeholder="Event title" required />
              <Textarea name="description" placeholder="Description…" rows={2} />
              <Input name="eventType" placeholder="Type (e.g., milestone, battle)" />
              <Input name="significance" type="number" placeholder="Significance (1-5)" min={1} max={5} />
              <Input name="happenedAt" type="datetime-local" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Recording…' : 'Record'}</Button>
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

      <div className="space-y-3">
        {events?.map((ev) => (
          <div key={ev.id} className="rounded-card border border-ridge bg-surface bg-surface-grad p-5 transition-all duration-archive hover:border-gold/10">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-ridge bg-depth">
                <Clock className="h-4 w-4 text-ash" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-h3 text-parchment">{ev.title}</h3>
                  <span className="text-tiny text-dust">{new Date(ev.happenedAt).toLocaleDateString()}</span>
                </div>
                {ev.description && (
                  <p className="text-small text-ash leading-relaxed">{ev.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-ridge bg-depth px-2.5 py-0.5 text-tiny text-dust uppercase tracking-wider">
                    {ev.eventType}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.max(1, ev.significance)) }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-ember" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-dust">
          <Clock className="h-10 w-10 opacity-20" strokeWidth={1.5} />
          <div className="text-center space-y-1">
            <p className="text-body">The chronicle is blank.</p>
            <p className="text-small">Events arise from dialogue and discovery.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineDetail({ eventId }: { eventId: number }) {
  const { data: event, loading, error } = useApi<TimelineEvent>(`/timeline/${eventId}`);

  return (
    <div className="space-y-section">
      <div className="flex items-center gap-3">
        <Link to="/timeline">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-label">CHRONICLE ENTRY</p>
          <h1 className="font-serif text-display text-parchment">{event?.title ?? 'Event'}</h1>
        </div>
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

      {event && (
        <Card>
          <CardContent className="p-inner space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-card border border-ridge bg-depth">
                <CalendarDays className="h-4 w-4 text-ash" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-h2 text-parchment">{event.title}</h2>
                <p className="text-small text-dust">{new Date(event.happenedAt).toLocaleString()}</p>
              </div>
            </div>
            {event.description && (
              <p className="text-body text-ash leading-relaxed">{event.description}</p>
            )}
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-ridge bg-depth px-3 py-1 text-tiny text-dust uppercase tracking-wider">
                {event.eventType}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.max(1, event.significance)) }).map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-ember" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
