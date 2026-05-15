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
        <CardContent className="py-6 text-center text-sm text-slate-500">
          No memories yet. Meaningful conversations will create memories.
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
              <Brain className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-sm">Memory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-slate-700 dark:text-slate-300">{m.content}</p>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.max(1, Math.round(m.importance * 5))) }).map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-violet-500" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
