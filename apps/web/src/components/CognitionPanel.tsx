import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, BookOpen, Heart, Clock, MessageSquare, ChevronDown, ChevronUp, Sparkles, Activity } from 'lucide-react';

export interface CognitionLoreHit {
  id: number;
  score: number;
  payload: {
    loreEntryId: number;
    worldId: number;
    title: string;
    chunkIndex: number;
    chunkText: string;
  };
}

export interface CognitionData {
  prompt: string;
  character: { id: number; name: string; personality: string | null; description: string | null; role: string | null };
  retrievedLore: CognitionLoreHit[];
  retrievedMemories: Array<{ content: string; importance: number }>;
  relationships: Array<{ toCharacterId: number; trust: number; respect: number; affection: number; rivalry: number; fear: number; alignment: number; notes: string | null }>;
  timeline: Array<{ title: string; description: string | null; happenedAt: string; eventType: string; significance: number | null }>;
  history: Array<{ role: string; content: string }>;
  aiMode: 'live' | 'simulated';
  contextEstimate: {
    promptCharacters: number;
    promptWords: number;
    loreCount: number;
    memoryCount: number;
    relationshipCount: number;
    timelineCount: number;
  };
}

export function CognitionPanel({ data, streaming }: { data: CognitionData | null; streaming?: boolean }) {
  const [promptOpen, setPromptOpen] = useState(false);

  if (!data) {
    return (
      <Card className="border-ridge/80 bg-depth/70">
        <CardContent className="space-y-4 py-5">
          <div>
            <p className="text-label">Cognition Inspector</p>
            <p className="mt-2 text-small text-dust">Send a message to watch retrieval, context assembly, generation, and persistence become visible.</p>
          </div>
          <div className="space-y-2 border-l border-ridge pl-3">
            {['Retrieve archive', 'Assemble context', 'Generate voice', 'Persist memory'].map((step) => (
              <div key={step} className="flex items-center gap-2 text-tiny text-dust">
                <span className="h-1.5 w-1.5 rounded-full bg-ghost" />
                {step}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasLore = data.retrievedLore.length > 0;
  const hasMemories = data.retrievedMemories.length > 0;
  const hasRelationships = data.relationships.length > 0;
  const hasTimeline = data.timeline.length > 0;
  const hasHistory = data.history.length > 0;

  return (
    <div className="space-y-4">
      {/* AI Mode */}
      <div className="flex items-center justify-between rounded-card border border-ridge bg-depth px-3 py-2">
        <div className="flex items-center gap-2">
          <Activity className={`h-3.5 w-3.5 text-gold ${streaming ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
          <span className="text-tiny text-ash uppercase tracking-wider">
            {streaming ? 'Generating' : data.aiMode === 'live' ? 'Live Generation' : 'Simulated'}
          </span>
        </div>
        <span className={`h-1.5 w-1.5 rounded-full ${data.aiMode === 'live' ? 'bg-gold' : 'bg-dust'}`} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-tiny">
        <div className="rounded-card border border-ridge bg-depth px-3 py-2">
          <p className="text-dust">Context</p>
          <p className="font-mono text-ash">{data.contextEstimate.promptWords} words</p>
        </div>
        <div className="rounded-card border border-ridge bg-depth px-3 py-2">
          <p className="text-dust">Signals</p>
          <p className="font-mono text-ash">
            {data.contextEstimate.loreCount + data.contextEstimate.memoryCount + data.contextEstimate.relationshipCount + data.contextEstimate.timelineCount}
          </p>
        </div>
      </div>

      {/* Retrieved Lore */}
      {hasLore && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-label">Retrieved Lore</span>
            <span className="text-tiny text-dust">({data.retrievedLore.length})</span>
          </div>
          <div className="space-y-2">
            {data.retrievedLore.map((hit, i) => (
              <div key={i} className="rounded-card border border-ridge bg-depth p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-small font-medium text-parchment">{hit.payload.title}</span>
                  <span className="text-tiny font-mono text-dust">score {hit.score.toFixed(3)}</span>
                </div>
                <p className="text-tiny text-ash line-clamp-2">{hit.payload.chunkText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recalled Memories */}
      {hasMemories && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-memory" strokeWidth={1.5} />
            <span className="text-label">Recalled Memories</span>
            <span className="text-tiny text-dust">({data.retrievedMemories.length})</span>
          </div>
          <div className="space-y-2">
            {data.retrievedMemories.map((mem, i) => (
              <div key={i} className="rounded-card border border-ridge bg-depth p-3">
                <p className="text-small text-ash italic leading-relaxed">“{mem.content}”</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.max(1, Math.round(mem.importance * 5))) }).map((_, j) => (
                    <span key={j} className="h-1 w-1 rounded-full bg-memory" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      {hasRelationships && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-trust" strokeWidth={1.5} />
            <span className="text-label">Active Relationships</span>
          </div>
          <div className="space-y-2">
            {data.relationships.map((rel) => (
              <div key={rel.toCharacterId} className="rounded-card border border-ridge bg-depth p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-small text-parchment">→ Character {rel.toCharacterId}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-tiny">
                  <span className="text-dust">trust <span className="text-ash font-mono">{rel.trust.toFixed(2)}</span></span>
                  <span className="text-dust">respect <span className="text-ash font-mono">{rel.respect.toFixed(2)}</span></span>
                  <span className="text-dust">affection <span className="text-ash font-mono">{rel.affection.toFixed(2)}</span></span>
                  <span className="text-dust">fear <span className="text-ash font-mono">{rel.fear.toFixed(2)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Context */}
      {hasTimeline && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-ember" strokeWidth={1.5} />
            <span className="text-label">Timeline Context</span>
          </div>
          <div className="space-y-2">
            {data.timeline.map((ev, i) => (
              <div key={i} className="rounded-card border border-ridge bg-depth p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-small text-parchment">{ev.title}</span>
                  <span className="text-tiny text-dust">{new Date(ev.happenedAt).toLocaleDateString()}</span>
                </div>
                {ev.description && (
                  <p className="text-tiny text-ash line-clamp-2">{ev.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {hasHistory && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-mist" strokeWidth={1.5} />
            <span className="text-label">Conversation History</span>
            <span className="text-tiny text-dust">({data.history.length})</span>
          </div>
          <div className="space-y-1.5">
            {data.history.slice(-4).map((msg, i) => (
              <div key={i} className="rounded-card border border-ridge bg-depth p-2.5">
                <span className="text-tiny text-gold uppercase tracking-wider">{msg.role}</span>
                <p className="text-tiny text-ash line-clamp-1 mt-0.5">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assembled Prompt */}
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => setPromptOpen(!promptOpen)} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-label">Assembled Prompt</span>
          </div>
          {promptOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
        {promptOpen && (
          <div className="rounded-card border border-ridge bg-depth p-3">
            <pre className="text-tiny text-ash whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
              {data.prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
