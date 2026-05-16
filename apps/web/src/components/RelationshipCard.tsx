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
  const color = pct > 0 ? 'bg-trust' : pct < 0 ? 'bg-fear' : 'bg-ridge';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-tiny">
        <span className="uppercase tracking-wider text-dust">{label}</span>
        <span className="font-mono text-mono-sm text-ash">{pct.toFixed(0)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-depth border border-ridge">
        <div
          className={`h-full ${color} transition-all duration-archive`}
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
        <CardContent className="py-6 text-center">
          <p className="text-small text-dust">No relationship data yet.</p>
          <p className="text-tiny text-ghost mt-1">Dialogue will forge connections.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map((rel) => (
        <Card key={rel.id}>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-h3 text-parchment">
              Bond {rel.fromCharacterId} → {rel.toCharacterId}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScoreBar label="trust" value={rel.trust} />
            <ScoreBar label="respect" value={rel.respect} />
            <ScoreBar label="affection" value={rel.affection} />
            <ScoreBar label="rivalry" value={rel.rivalry} />
            <ScoreBar label="fear" value={rel.fear} />
            <ScoreBar label="alignment" value={rel.alignment} />
            {rel.notes && (
              <p className="mt-2 text-tiny text-dust italic border-l-2 border-gold/20 pl-3">
                {rel.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
