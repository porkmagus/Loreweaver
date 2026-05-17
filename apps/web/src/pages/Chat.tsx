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
import { PortraitFrame } from '@/components/VisualAssetFrame';
import { getCharacterPortrait } from '@/lib/visualAssets';
import { setActiveWorldId, setActiveCharacterId } from '@/lib/activeState';
import { Send, Bot, User, Sparkles, BookOpen, Brain, HeartPulse, Clock, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { World, Character, Relationship, TimelineEvent, Memory } from '@loreweaver/shared';
import { useSearchParams } from 'react-router-dom';

interface ChatSession {
  id: number;
  worldId: number;
  characterId: number;
  userId: number | null;
  title: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

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

function useMergeableHistory(historyData: ChatMessage[] | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!historyData || !Array.isArray(historyData)) return;

    setMessages((prev) => {
      // Never overwrite while optimistic/streaming messages are active
      if (prev.some((m) => m.pending)) return prev;
      // Load server history when local state is empty (initial mount / after reset)
      if (prev.length === 0) return historyData;

      const lastLocal = prev[prev.length - 1];
      const lastServer = historyData[historyData.length - 1];
      // Accept server history only if it has the same or more messages
      // AND the last message content/role match the local last message.
      // This proves the server state is fresh (not a stale refetch).
      const serverIsFresh =
        historyData.length >= prev.length &&
        lastServer.role === lastLocal.role &&
        lastServer.content === lastLocal.content;

      return serverIsFresh ? historyData : prev;
    });
  }, [historyData]);

  return { messages, setMessages };
}

function useSmartScroll() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollContainerRef.current;
    if (!el || !isNearBottomRef.current) return;
    if (behavior === 'smooth') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 80;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  return { scrollContainerRef, messagesEndRef, scrollToBottom, handleScroll, isNearBottomRef };
}

export function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: worlds } = useApi<World[]>('/worlds');
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const charactersUrl = selectedWorldId ? `/worlds/${selectedWorldId}/characters` : null;
  const { data: characters, loading: charactersLoading } = useApi<Character[]>(charactersUrl);

  const historyUrl = selectedCharacterId
    ? `/chat/character/${selectedCharacterId}/history${sessionId ? `?sessionId=${sessionId}` : ''}`
    : null;
  const { data: historyData, refetch: refetchHistory } = useApi<ChatMessage[]>(historyUrl);

  const sessionsUrl = selectedCharacterId && !sessionId ? `/chat/character/${selectedCharacterId}/sessions` : null;
  const { data: sessionsData } = useApi<ChatSession[]>(sessionsUrl);

  const relationshipsUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/relationships` : null;
  const { data: relationshipsData, refetch: refetchRelationships } = useApi<Relationship[]>(relationshipsUrl);

  const timelineUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/timeline` : null;
  const { data: timelineData, refetch: refetchTimeline } = useApi<TimelineEvent[]>(timelineUrl);

  const memoriesUrl = selectedCharacterId ? `/characters/${selectedCharacterId}/memories` : null;
  const { data: memoriesData, refetch: refetchMemories } = useApi<Memory[]>(memoriesUrl);

  const { messages, setMessages } = useMergeableHistory(historyData);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextRefreshing, setContextRefreshing] = useState(false);
  const [cognitionData, setCognitionData] = useState<CognitionData | null>(null);
  const [retrievedLore, setRetrievedLore] = useState<CognitionLoreHit[]>([]);
  const [recalledMemories, setRecalledMemories] = useState<CognitionData['retrievedMemories']>([]);
  const [latestEffects, setLatestEffects] = useState<PostChatEffects | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const { scrollContainerRef, messagesEndRef, scrollToBottom, handleScroll } = useSmartScroll();

  // Restore world/character/session from URL on mount
  useEffect(() => {
    const worldParam = Number(searchParams.get('worldId'));
    if (!selectedWorldId && Number.isFinite(worldParam) && worldParam > 0) {
      setSelectedWorldId(worldParam);
    }
  }, [searchParams, selectedWorldId]);

  useEffect(() => {
    const characterParam = Number(searchParams.get('characterId'));
    if (!selectedCharacterId && Number.isFinite(characterParam) && characterParam > 0 && characters?.some((c) => c.id === characterParam)) {
      setSelectedCharacterId(characterParam);
    }
  }, [searchParams, selectedCharacterId, characters]);

  useEffect(() => {
    const sessionParam = Number(searchParams.get('sessionId'));
    if (!sessionId && Number.isFinite(sessionParam) && sessionParam > 0) {
      setSessionId(sessionParam);
    }
  }, [searchParams, sessionId]);

  useEffect(() => {
    if (selectedWorldId) setActiveWorldId(selectedWorldId);
  }, [selectedWorldId]);

  useEffect(() => {
    if (selectedCharacterId) setActiveCharacterId(selectedCharacterId);
  }, [selectedCharacterId]);

  // When a character is selected but no sessionId is known, use the latest persisted session
  useEffect(() => {
    if (selectedCharacterId && !sessionId && sessionsData && sessionsData.length > 0) {
      setSessionId(sessionsData[0].id);
    }
  }, [selectedCharacterId, sessionId, sessionsData]);

  // Sync sessionId back to URL so it survives navigation and refresh
  const updateUrlSession = useCallback((nextSessionId: number | null) => {
    const params = new URLSearchParams(searchParams);
    if (selectedWorldId) params.set('worldId', String(selectedWorldId));
    if (selectedCharacterId) params.set('characterId', String(selectedCharacterId));
    if (nextSessionId) params.set('sessionId', String(nextSessionId));
    else params.delete('sessionId');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams, selectedWorldId, selectedCharacterId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, sending, scrollToBottom]);

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
    updateUrlSession(res.sessionId);
    setMessages((prev) => prev.map((msg) => (
      msg.pending
        ? { ...msg, content: res.reply, pending: false, createdAt: new Date().toISOString() }
        : msg
    )));
    refetchHistory();
    refreshContextPanels();
  }, [selectedCharacterId, selectedWorldId, sessionId, refetchHistory, refreshContextPanels, updateUrlSession]);

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
          updateUrlSession(event.sessionId);
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
  }, [selectedCharacterId, selectedWorldId, sessionId, refetchHistory, refreshContextPanels, updateUrlSession]);

  const handleSend = useCallback(async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
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
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-section space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCharacter && (
              <PortraitFrame
                asset={getCharacterPortrait(selectedCharacter.metadata)}
                name={selectedCharacter.name}
                role={selectedCharacter.role}
                className="hidden h-20 w-16 shrink-0 md:block"
              />
            )}
            <div>
              <p className="text-label mb-1">DIALOGUE</p>
              <h1 className="font-serif text-display text-parchment">
                {selectedCharacter ? selectedCharacter.name : 'Converse'}
              </h1>
            </div>
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
                const nextWorldId = Number.isFinite(id) && id > 0 ? id : null;
                setSelectedWorldId(nextWorldId);
                setSelectedCharacterId(null);
                setSessionId(null);
                setMessages([]);
                const params = new URLSearchParams(searchParams);
                if (nextWorldId) params.set('worldId', String(nextWorldId));
                else params.delete('worldId');
                params.delete('characterId');
                params.delete('sessionId');
                setSearchParams(params, { replace: true });
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
                      const nextCharacterId = Number.isFinite(id) && id > 0 ? id : null;
                      setSelectedCharacterId(nextCharacterId);
                      setSessionId(null);
                      setMessages([]);
                      const params = new URLSearchParams(searchParams);
                      if (nextCharacterId) params.set('characterId', String(nextCharacterId));
                      else params.delete('characterId');
                      params.delete('sessionId');
                      setSearchParams(params, { replace: true });
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

      <div className="flex flex-1 gap-section overflow-hidden min-h-0">
        {/* Chat Panel */}
        <Card className="flex flex-1 flex-col overflow-hidden border-ridge min-h-0">
          <CardContent className="flex flex-1 flex-col p-0 min-h-0">
            {/* Messages */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto p-inner space-y-6 [scrollbar-gutter:stable]"
            >
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
              {messages.map((msg) => (
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
                    <p className={`text-body leading-relaxed whitespace-pre-wrap break-words ${
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

              {/* Compact cognition badges (non-blocking) */}
              {(retrievedLore.length > 0 || recalledMemories.length > 0 || latestEffects) && (
                <div className="flex flex-wrap gap-2 border-t border-ridge/70 pt-3">
                  {retrievedLore.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-card border border-ridge bg-depth/70 px-2 py-1 text-tiny text-dust">
                      <BookOpen className="h-3 w-3 text-gold" strokeWidth={1.5} />
                      {retrievedLore.length} lore {retrievedLore.length === 1 ? 'chunk' : 'chunks'}
                    </span>
                  )}
                  {recalledMemories.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-card border border-ridge bg-depth/70 px-2 py-1 text-tiny text-dust">
                      <Brain className="h-3 w-3 text-memory" strokeWidth={1.5} />
                      {recalledMemories.length} {recalledMemories.length === 1 ? 'memory' : 'memories'}
                    </span>
                  )}
                  {latestEffects && latestEffects.relationshipUpdates.some((u) => [u.trustDelta, u.respectDelta, u.affectionDelta, u.rivalryDelta, u.fearDelta].some((v) => v !== 0)) && (
                    <span className="inline-flex items-center gap-1.5 rounded-card border border-ridge bg-depth/70 px-2 py-1 text-tiny text-dust">
                      <HeartPulse className="h-3 w-3 text-trust" strokeWidth={1.5} />
                      Relationships shifted
                    </span>
                  )}
                  {latestEffects?.timelineCreated && (
                    <span className="inline-flex items-center gap-1.5 rounded-card border border-ridge bg-depth/70 px-2 py-1 text-tiny text-dust">
                      <Clock className="h-3 w-3 text-ember" strokeWidth={1.5} />
                      Timeline updated
                    </span>
                  )}
                  {latestEffects?.memoryCreated && (
                    <span className="inline-flex items-center gap-1.5 rounded-card border border-ridge bg-depth/70 px-2 py-1 text-tiny text-dust">
                      <Brain className="h-3 w-3 text-memory" strokeWidth={1.5} />
                      Memory preserved
                    </span>
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
          <div className="hidden w-96 h-full flex-col gap-4 overflow-y-auto pr-3 [scrollbar-gutter:stable] md:flex min-h-0">
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
