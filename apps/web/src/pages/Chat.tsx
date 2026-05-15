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
      // Allow a short delay for background DB writes (relationships, timeline, memories)
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

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col max-w-6xl">
      <div className="mb-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Chat
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Converse with a character from your story universe.
        </p>

        {/* Selectors */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedWorldId ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedWorldId(Number.isFinite(id) && id > 0 ? id : null);
              setSelectedCharacterId(null);
              setSessionId(null);
              setMessages([]);
            }}
            className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          >
            <option value="">Select world…</option>
            {worlds?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {selectedWorldId && (
            <>
              {charactersLoading ? (
                <Spinner />
              ) : (
                <select
                  value={selectedCharacterId ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedCharacterId(Number.isFinite(id) && id > 0 ? id : null);
                    setSessionId(null);
                    setMessages([]);
                  }}
                  className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                >
                  <option value="">Select character…</option>
                  {characters?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Chat Panel */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardContent className="flex flex-1 flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Bot className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">
                    {selectedCharacterId
                      ? 'Start a conversation with this character.'
                      : 'Select a character to begin chatting.'}
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="mt-1 block text-[10px] opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <form onSubmit={handleSend} className="flex items-end gap-2">
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
                      ? `Message ${characters?.find((c) => c.id === selectedCharacterId)?.name ?? 'character'}…`
                      : 'Select a character to chat…'
                  }
                  rows={1}
                  className="min-h-[44px] resize-none"
                  disabled={!selectedCharacterId}
                />
                <Button type="submit" disabled={!input.trim() || sending || !selectedCharacterId} variant="primary" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Context Panel */}
        {selectedCharacterId && (
          <div className="hidden w-80 flex-col gap-4 overflow-y-auto md:flex">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Relationships</span>
              {contextRefreshing && <Spinner className="h-3 w-3" />}
            </div>
            <RelationshipCard relationships={relationshipsData ?? []} />
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Timeline</span>
              {contextRefreshing && <Spinner className="h-3 w-3" />}
            </div>
            <TimelineCard events={timelineData ?? []} />
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Memories</span>
              {contextRefreshing && <Spinner className="h-3 w-3" />}
            </div>
            <MemoryCard memories={memoriesData ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
