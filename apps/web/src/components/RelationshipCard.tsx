import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Relationship {
  id: number;
  fromCharacterId: number;
  toCharacterId: number;
  trust: number;
  respect: number;
  affection: number;
  rivalry: number;
  fear: number;
  alignment: number;
  notes?: string | null;
  updatedAt?: string;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(-100, Math.min(100, value));
  const color = pct > 0 ? 'bg-emerald-500' : pct < 0 ? 'bg-rose-500' : 'bg-slate-300';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="capitalize text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-medium tabular-nums">{pct.toFixed(0)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${Math.abs(pct)}%` }}
        />
      </div>
    </div>
  );
}

export function RelationshipCard({ relationships }: { relationships: Relationship[] }) {
  if (!relationships || relationships.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-slate-500">
          No relationship data yet. Chat to build relationships.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map((rel) => (
        <Card key={rel.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Character {rel.fromCharacterId} → {rel.toCharacterId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScoreBar label="trust" value={rel.trust} />
            <ScoreBar label="respect" value={rel.respect} />
            <ScoreBar label="affection" value={rel.affection} />
            <ScoreBar label="rivalry" value={rel.rivalry} />
            <ScoreBar label="fear" value={rel.fear} />
            <ScoreBar label="alignment" value={rel.alignment} />
            {rel.notes && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{rel.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
