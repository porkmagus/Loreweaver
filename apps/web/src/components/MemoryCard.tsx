import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Brain } from 'lucide-react';

interface Memory {
  id: number;
  characterId: number;
  content: string;
  importance: number;
  createdAt: string;
}

export function MemoryCard({ memories }: { memories: Memory[] }) {
  if (!memories || memories.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-small text-dust">No memories yet.</p>
          <p className="text-tiny text-ghost mt-1">Meaningful dialogue will create impressions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((m) => (
        <Card key={m.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-memory" strokeWidth={1.5} />
              <CardTitle className="font-serif text-h3 text-parchment">Memory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-small text-ash leading-relaxed italic">
              “{m.content}”
            </p>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.max(1, Math.round(m.importance * 5))) }).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-memory" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
