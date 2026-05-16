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
  interaction: 'border-mist/30 text-mist',
  conversation: 'border-sage/30 text-sage',
  discovery: 'border-gold/30 text-gold',
  alliance: 'border-trust/30 text-trust',
  betrayal: 'border-fear/30 text-fear',
  conflict: 'border-ember/30 text-ember',
  lore_reveal: 'border-memory/30 text-memory',
  relationship_change: 'border-silver/30 text-silver',
  memory_created: 'border-memory/30 text-memory',
};

function EventBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? 'border-ridge text-dust';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-tiny font-medium uppercase tracking-wider ${cls}`}>
      {type}
    </span>
  );
}

export function TimelineCard({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-small text-dust">No events recorded.</p>
          <p className="text-tiny text-ghost mt-1">Meaningful dialogue will generate entries.</p>
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
              <CardTitle className="font-serif text-h3 text-parchment">{ev.title}</CardTitle>
              <EventBadge type={ev.eventType} />
            </div>
            <p className="text-tiny text-dust">
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
              <p className="text-small text-ash line-clamp-3 leading-relaxed">{ev.description}</p>
            )}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.max(1, ev.significance)) }).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-ember" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
