import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useApi, apiPost, API_BASE } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { RelationshipCard } from '@/components/RelationshipCard';
import { TimelineCard } from '@/components/TimelineCard';
import { MemoryCard } from '@/components/MemoryCard';
import { CognitionPanel, type CognitionData, type CognitionLoreHit } from '@/components/CognitionPanel';
import { Send, Bot, User, Sparkles, BookOpen, Brain, Clock, HeartPulse, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { World, Character, Relationship, TimelineEvent, Memory } from '@loreweaver/shared';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  pending?: boolean;
}

interface PostChatEffects {
  timelineCreated: boolean;
  memoryCreated: boolean;
  topic: string;
  relationshipUpdates: Array<{
    toCharacterId: number;
    trustDelta: number;
    respectDelta: number;
    affectionDelta: number;
    rivalryDelta: number;
    fearDelta: number;
    alignmentDelta: number;
  }>;
}

type StreamEvent =
  | { type: 'retrieved'; lore?: CognitionLoreHit[]; memories?: CognitionData['retrievedMemories']; cognition?: CognitionData }
  | { type: 'token'; content?: string }
  | { type: 'done'; sessionId?: number; effects?: PostChatEffects }
  | { type: 'error'; error?: string };

export function Chat() {
  const { data: worlds } = useApi<World[]>('/worlds');
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const charactersUrl = selectedWorldId ? `/worlds/${selectedWorldId}/characters` : null;
  const { data: characters, loading: charactersLoading } = useApi<Character[]>(charactersUrl);

  const historyUrl = selectedCharacterId && sessionId
    ? `/chat/character/${selectedCharacterId}/history?sessionId=${sessionId}`
    : null;
  const { data: historyData, refetch: refetchHistory } = useApi<ChatMessage[]>(historyUrl);

  const relationshipsUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/relationships` : null;
  const { data: relationshipsData, refetch: refetchRelationships } = useApi<Relationship[]>(relationshipsUrl);

  const timelineUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/timeline` : null;
  const { data: timelineData, refetch: refetchTimeline } = useApi<TimelineEvent[]>(timelineUrl);

  const memoriesUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/memories` : null;
  const { data: memoriesData, refetch: refetchMemories } = useApi<Memory[]>(memoriesUrl);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextRefreshing, setContextRefreshing] = useState(false);
  const [cognitionData, setCognitionData] = useState<CognitionData | null>(null);
  const [retrievedLore, setRetrievedLore] = useState<CognitionLoreHit[]>([]);
  const [recalledMemories, setRecalledMemories] = useState<CognitionData['retrievedMemories']>([]);
  const [latestEffects, setLatestEffects] = useState<PostChatEffects | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (historyData && Array.isArray(historyData)) {
      setMessages(historyData);
    }
  }, [historyData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const refreshContextPanels = useCallback(() => {
    setContextRefreshing(true);
    setTimeout(() => {
      refetchRelationships();
      refetchTimeline();
      refetchMemories();
      setContextRefreshing(false);
    }, 500);
  }, [refetchRelationships, refetchTimeline, refetchMemories]);

  const sendWithStandardFallback = useCallback(async (message: string) => {
    const res = await apiPost<{ reply: string; sessionId: number }>(
      `/chat/character/${selectedCharacterId}`,
      {
        worldId: selectedWorldId,
        message,
        sessionId: sessionId ?? undefined,
      },
    );

    setSessionId(res.sessionId);
    setMessages((prev) => prev.map((msg) => (
      msg.pending
        ? { ...msg, content: res.reply, pending: false, createdAt: new Date().toISOString() }
        : msg
    )));
    refetchHistory();
    refreshContextPanels();
  }, [selectedCharacterId, selectedWorldId, sessionId, refetchHistory, refreshContextPanels]);

  const sendWithStreaming = useCallback(async (message: string) => {
    const response = await fetch(`${API_BASE}/chat/character/${selectedCharacterId}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        worldId: selectedWorldId,
        message,
        sessionId: sessionId ?? undefined,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const handleEvent = (event: StreamEvent) => {
      if (event.type === 'retrieved') {
        setRetrievedLore(event.lore ?? []);
        setRecalledMemories(event.memories ?? []);
        if (event.cognition) {
          setCognitionData(event.cognition);
        }
        return;
      }

      if (event.type === 'token' && event.content) {
        setMessages((prev) => prev.map((msg) => (
          msg.pending ? { ...msg, content: msg.content + event.content } : msg
        )));
        return;
      }

      if (event.type === 'done') {
        if (event.sessionId) {
          setSessionId(event.sessionId);
        }
        if (event.effects) {
          setLatestEffects(event.effects);
        }
        setMessages((prev) => prev.map((msg) => (msg.pending ? { ...msg, pending: false } : msg)));
        refetchHistory();
        refreshContextPanels();
        return;
      }

      if (event.type === 'error') {
        throw new Error(event.error ?? 'Stream failed');
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));
        if (!dataLine) continue;
        handleEvent(JSON.parse(dataLine.slice(6)) as StreamEvent);
      }
    }
  }, [selectedCharacterId, selectedWorldId, sessionId, refetchHistory, refreshContextPanels]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !selectedWorldId || !selectedCharacterId) return;

    const trimmed = input.trim();
    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: trimmed, createdAt: new Date().toISOString() },
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString(), pending: true },
    ]);
    setInput('');
    setSending(true);
    setError(null);
    setRetrievedLore([]);
    setRecalledMemories([]);
    setLatestEffects(null);

    try {
      await sendWithStreaming(trimmed);
    } catch (err) {
      try {
        await sendWithStandardFallback(trimmed);
        setError('Streaming fell back to the standard response path.');
      } catch (fallbackErr) {
        setMessages((prev) => prev.filter((msg) => !msg.pending));
        setError(fallbackErr instanceof Error ? fallbackErr.message : err instanceof Error ? err.message : 'Chat failed');
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, selectedWorldId, selectedCharacterId, sendWithStreaming, sendWithStandardFallback]);

  const selectedCharacter = characters?.find((c) => c.id === selectedCharacterId);
  const pipelineSteps = [
    { label: 'retrieve', active: retrievedLore.length > 0 || recalledMemories.length > 0 },
    { label: 'assemble', active: Boolean(cognitionData) },
    { label: 'generate', active: sending },
    { label: 'persist', active: Boolean(latestEffects) },
    { label: 'reflect', active: Boolean(latestEffects?.timelineCreated || latestEffects?.memoryCreated) },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-section space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label mb-1">DIALOGUE</p>
            <h1 className="font-serif text-display text-parchment">
              {selectedCharacter ? selectedCharacter.name : 'Converse'}
            </h1>
          </div>
          {selectedCharacterId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInspectorOpen((open) => !open)}
              className="hidden md:inline-flex"
            >
              {inspectorOpen ? (
                <PanelRightClose className="mr-2 h-4 w-4" strokeWidth={1.5} />
              ) : (
                <PanelRightOpen className="mr-2 h-4 w-4" strokeWidth={1.5} />
              )}
              Inspector
            </Button>
          )}
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={selectedWorldId ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedWorldId(Number.isFinite(id) && id > 0 ? id : null);
                setSelectedCharacterId(null);
                setSessionId(null);
                setMessages([]);
              }}
              className="h-10 appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
            >
              <option value="" className="bg-depth">Select world…</option>
              {worlds?.map((w) => (
                <option key={w.id} value={w.id} className="bg-depth">{w.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {selectedWorldId && (
            <>
              {charactersLoading ? (
                <Spinner />
              ) : (
                <div className="relative">
                  <select
                    value={selectedCharacterId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedCharacterId(Number.isFinite(id) && id > 0 ? id : null);
                      setSessionId(null);
                      setMessages([]);
                    }}
                    className="h-10 appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
                  >
                    <option value="" className="bg-depth">Select character…</option>
                    {characters?.map((c) => (
                      <option key={c.id} value={c.id} className="bg-depth">{c.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-section overflow-hidden">
        {/* Chat Panel */}
        <Card className="flex flex-1 flex-col overflow-hidden border-ridge">
          <CardContent className="flex flex-1 flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-inner space-y-6">
              {selectedCharacterId && (
                <div className="grid gap-2 border-b border-ridge/70 pb-4 text-tiny text-dust sm:grid-cols-5">
                  {pipelineSteps.map(({ label, active }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-gold shadow-gold-glow' : 'bg-ghost'}`} />
                      <span className={active ? 'text-ash' : 'text-dust'}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-dust">
                  <Bot className="h-12 w-12 opacity-20" strokeWidth={1.5} />
                  <div className="text-center space-y-1">
                    <p className="text-body">
                      {selectedCharacterId
                        ? `Begin your dialogue with ${selectedCharacter?.name ?? 'this character'}.`
                        : 'Select a character to begin.'}
                    </p>
                    {selectedCharacter?.personality && (
                      <p className="text-small text-dust max-w-md italic">
                        “{selectedCharacter.personality}”
                      </p>
                    )}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-card border ${
                      msg.role === 'user'
                        ? 'border-gold/30 bg-gold/5'
                        : 'border-ridge bg-surface'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    ) : (
                      <Bot className="h-4 w-4 text-ash" strokeWidth={1.5} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] space-y-1 ${
                      msg.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    <p className={`text-body leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' ? 'text-parchment' : 'text-ash'
                    }`}>
                      {msg.content || (msg.pending ? (
                        <span className="inline-flex items-center gap-2 text-small italic text-dust">
                          <Sparkles className="h-3 w-3 animate-pulse" strokeWidth={1.5} />
                          Listening to the archive...
                        </span>
                      ) : null)}
                    </p>
                    <span className="text-tiny text-ghost">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {(retrievedLore.length > 0 || recalledMemories.length > 0 || latestEffects) && (
                <div className="space-y-3 border-t border-ridge/70 pt-4">
                  {retrievedLore.length > 0 && (
                    <div className="rounded-card border border-ridge bg-depth/70 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gold" strokeWidth={1.5} />
                        <p className="text-label">Retrieved Lore</p>
                      </div>
                      <div className="space-y-2">
                        {retrievedLore.slice(0, 2).map((hit) => (
                          <div key={`${hit.id}-${hit.payload.chunkIndex}`} className="text-small text-ash">
                            <span className="text-parchment">{hit.payload.title}</span>
                            <span className="ml-2 font-mono text-tiny text-dust">{hit.score.toFixed(3)}</span>
                            <p className="mt-1 line-clamp-2 text-tiny leading-relaxed text-dust">{hit.payload.chunkText}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recalledMemories.length > 0 && (
                    <div className="rounded-card border border-ridge bg-depth/70 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-memory" strokeWidth={1.5} />
                        <p className="text-label">Recalled Memory</p>
                      </div>
                      <p className="line-clamp-2 text-small italic leading-relaxed text-ash">
                        "{recalledMemories[0].content}"
                      </p>
                    </div>
                  )}

                  {latestEffects && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-card border border-ridge bg-depth/70 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <HeartPulse className="h-4 w-4 text-trust" strokeWidth={1.5} />
                          <p className="text-label">Relationship Drift</p>
                        </div>
                        {latestEffects.relationshipUpdates.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {latestEffects.relationshipUpdates.flatMap((update) => [
                              ['Trust', update.trustDelta],
                              ['Respect', update.respectDelta],
                              ['Affection', update.affectionDelta],
                              ['Rivalry', update.rivalryDelta],
                              ['Fear', update.fearDelta],
                            ] as const).filter(([, value]) => value !== 0).slice(0, 5).map(([label, value]) => (
                              <span key={`${label}-${value}`} className="rounded-card border border-ridge px-2 py-1 font-mono text-tiny text-ash">
                                {label} {value > 0 ? '+' : ''}{value.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-small text-dust">No measurable shift.</p>
                        )}
                      </div>
                      <div className="rounded-card border border-ridge bg-depth/70 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-ember" strokeWidth={1.5} />
                          <p className="text-label">Timeline</p>
                        </div>
                        <p className="text-small text-ash">
                          {latestEffects.timelineCreated
                            ? `Timeline updated: ${latestEffects.topic}`
                            : latestEffects.memoryCreated
                              ? `Memory preserved: ${latestEffects.topic}`
                              : `No new archive event for ${latestEffects.topic}.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-ridge p-4">
              <form onSubmit={handleSend} className="flex items-end gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder={
                    selectedCharacterId
                      ? `Address ${selectedCharacter?.name ?? 'character'}…`
                      : 'Select a persona first'
                  }
                  rows={1}
                  className="min-h-[48px] resize-none bg-depth"
                  disabled={!selectedCharacterId}
                />
                <Button type="submit" disabled={!input.trim() || sending || !selectedCharacterId} variant="primary" size="icon">
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Context Panel — Marginalia */}
        {selectedCharacterId && inspectorOpen && (
          <div className="hidden w-96 flex-col gap-4 overflow-y-auto md:flex">
            <div className="space-y-1">
              <p className="text-label">COGNITION</p>
              <CognitionPanel data={cognitionData} streaming={sending} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-label">RELATIONSHIPS</p>
                {contextRefreshing && <Spinner className="h-3 w-3" />}
              </div>
              <RelationshipCard relationships={relationshipsData ?? []} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-label">TIMELINE</p>
                {contextRefreshing && <Spinner className="h-3 w-3" />}
              </div>
              <TimelineCard events={timelineData ?? []} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-label">MEMORIES</p>
                {contextRefreshing && <Spinner className="h-3 w-3" />}
              </div>
              <MemoryCard memories={memoriesData ?? []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
