import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useApi, apiPost } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { RelationshipCard } from '@/components/RelationshipCard';
import { TimelineCard } from '@/components/TimelineCard';
import { MemoryCard } from '@/components/MemoryCard';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import type { World, Character, Relationship, TimelineEvent, Memory } from '@loreweaver/shared';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (historyData && Array.isArray(historyData)) {
      setMessages(historyData);
    }
  }, [historyData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !selectedWorldId || !selectedCharacterId) return;

    const trimmed = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: trimmed, createdAt: new Date().toISOString() },
    ]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await apiPost<{ reply: string; sessionId: number }>(
        `/chat/character/${selectedCharacterId}`,
        {
          worldId: selectedWorldId,
          message: trimmed,
          sessionId: sessionId ?? undefined,
        },
      );
      setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: res.reply, createdAt: new Date().toISOString() },
      ]);
      refetchHistory();
      setContextRefreshing(true);
      setTimeout(() => {
        refetchRelationships();
        refetchTimeline();
        refetchMemories();
        setContextRefreshing(false);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
      setSending(false);
      return;
    }
    setSending(false);
  }, [input, sending, selectedWorldId, selectedCharacterId, sessionId, refetchHistory, refetchRelationships, refetchTimeline, refetchMemories]);

  const selectedCharacter = characters?.find((c) => c.id === selectedCharacterId);

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
                      {msg.content}
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
              {sending && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card border border-ridge bg-surface">
                    <Bot className="h-4 w-4 text-ash" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-2 text-small text-dust">
                    <Sparkles className="h-3 w-3 animate-pulse" strokeWidth={1.5} />
                    <span className="italic">Composing response…</span>
                  </div>
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
        {selectedCharacterId && (
          <div className="hidden w-80 flex-col gap-4 overflow-y-auto md:flex">
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
