import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface TimelineEvent {
  id: number;
  characterId: number;
  title: string;
  description?: string | null;
  eventType: string;
  significance: number;
  happenedAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  interaction: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  conversation: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  discovery: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  alliance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  betrayal: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  conflict: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  lore_reveal: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  relationship_change: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  memory_created: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

function EventBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}

export function TimelineCard({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-slate-500">
          No timeline events yet. Meaningful conversations will generate events.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => (
        <Card key={ev.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{ev.title}</CardTitle>
              <EventBadge type={ev.eventType} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(ev.happenedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {ev.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{ev.description}</p>
            )}
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.max(1, ev.significance)) }).map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-rose-500" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
