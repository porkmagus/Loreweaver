import { eq, and, desc, isNull, gte, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { chatSessions, chatMessages, memories, timelineEvents } from '../db/schema.js';
import { getCharacterById } from './characterService.js';
import { getLoreByWorldId } from './loreService.js';
import { getRelationshipsForCharacter, updateRelationshipScores } from './relationshipService.js';
import { listTimelineByCharacter, createTimelineEvent } from './timelineService.js';
import { embedText } from './embedding.js';
import { searchLore, type SearchHit } from './qdrant.js';
import { scoreChatRelationship, extractSummary, clampScore } from '../utils/chatScoring.js';
import OpenAI from 'openai';

const SESSION_LIMIT = 10;
const HISTORY_LIMIT = 20;
const LORE_RETRIEVAL_LIMIT = 5;
const MEMORY_LIMIT = 10;
const TIMELINE_LIMIT = 5;
const RELATIONSHIP_LIMIT = 5;

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const chatModel = process.env.CHAT_MODEL ?? 'gpt-4o-mini';
type MemoryRow = typeof memories.$inferSelect;

export async function getOrCreateSession(characterId: number, worldId: number, userId?: number | null) {
  const existing = await db.select().from(chatSessions)
    .where(and(
      eq(chatSessions.characterId, characterId),
      eq(chatSessions.worldId, worldId),
      userId != null ? eq(chatSessions.userId, userId) : isNull(chatSessions.userId),
    ))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [session] = await db.insert(chatSessions).values({
    characterId,
    worldId,
    userId: userId ?? null,
    title: null,
    summary: null,
  }).returning();

  return session;
}

export async function getChatHistory(sessionId: number, limit = HISTORY_LIMIT) {
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(limit);
}

export async function getLatestSessionForCharacter(characterId: number) {
  const sessions = await db.select().from(chatSessions)
    .where(eq(chatSessions.characterId, characterId))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(1);
  return sessions[0] ?? null;
}

export async function listCharacterChatSessions(characterId: number, limit = SESSION_LIMIT) {
  return db.select().from(chatSessions)
    .where(eq(chatSessions.characterId, characterId))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(limit);
}

export async function getChatSessionSummary(sessionId: number) {
  const sessionMessages = await db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);

  return {
    sessionId,
    messageCount: sessionMessages.length,
    topics: sessionMessages.map((m) => m.content.slice(0, 100)),
  };
}

export async function saveMessage(sessionId: number, role: string, content: string) {
  const [msg] = await db.insert(chatMessages).values({
    sessionId,
    role,
    content,
    metadata: null,
  }).returning();

  // Bump session updated_at so getOrCreateSession returns the most recently active session
  await db.update(chatSessions)
    .set({ updatedAt: sql`now()` })
    .where(eq(chatSessions.id, sessionId));

  return msg;
}

export interface ChatContext {
  characterName: string;
  characterPersona: string;
  characterDescription: string;
  characterRole: string;
  lore: string[];
  memories: string[];
  relationships: string[];
  timeline: string[];
  history: string[];
}

export interface CognitionContext {
  character: Awaited<ReturnType<typeof getCharacterById>>;
  prompt: string;
  retrievedLore: SearchHit[];
  dbLore: Awaited<ReturnType<typeof getLoreByWorldId>>;
  retrievedMemories: MemoryRow[];
  relationships: Awaited<ReturnType<typeof getRelationshipsForCharacter>>;
  timeline: Awaited<ReturnType<typeof listTimelineByCharacter>>;
  history: Awaited<ReturnType<typeof getChatHistory>>;
  aiMode: 'live' | 'simulated';
}

export interface CognitionSnapshot {
  prompt: string;
  character: {
    id: number;
    name: string;
    personality: string | null;
    description: string | null;
    role: string | null;
  };
  retrievedLore: SearchHit[];
  retrievedMemories: Array<{ content: string; importance: number }>;
  relationships: Array<{
    toCharacterId: number;
    trust: number;
    respect: number;
    affection: number;
    rivalry: number;
    fear: number;
    alignment: number;
    notes: string | null;
  }>;
  timeline: Array<{
    title: string;
    description: string | null;
    happenedAt: Date | string;
    eventType: string;
    significance: number | null;
  }>;
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

export function toCognitionSnapshot(cognition: CognitionContext): CognitionSnapshot {
  const promptWords = cognition.prompt.trim().split(/\s+/).filter(Boolean).length;

  return {
    prompt: cognition.prompt,
    character: {
      id: cognition.character?.id ?? 0,
      name: cognition.character?.name ?? 'Unknown',
      personality: cognition.character?.personality ?? null,
      description: cognition.character?.description ?? null,
      role: cognition.character?.role ?? null,
    },
    retrievedLore: cognition.retrievedLore,
    retrievedMemories: cognition.retrievedMemories.map((memory) => ({
      content: memory.content,
      importance: memory.importance,
    })),
    relationships: cognition.relationships.map((relationship) => ({
      toCharacterId: relationship.toCharacterId,
      trust: relationship.trust,
      respect: relationship.respect,
      affection: relationship.affection,
      rivalry: relationship.rivalry,
      fear: relationship.fear,
      alignment: relationship.alignment,
      notes: relationship.notes,
    })),
    timeline: cognition.timeline.map((event) => ({
      title: event.title,
      description: event.description,
      happenedAt: event.happenedAt,
      eventType: event.eventType,
      significance: event.significance,
    })),
    history: cognition.history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    aiMode: cognition.aiMode,
    contextEstimate: {
      promptCharacters: cognition.prompt.length,
      promptWords,
      loreCount: cognition.retrievedLore.length,
      memoryCount: cognition.retrievedMemories.length,
      relationshipCount: cognition.relationships.length,
      timelineCount: cognition.timeline.length,
    },
  };
}

export async function buildCognitionContext(
  characterId: number,
  worldId: number,
  userMessage: string,
  sessionId: number,
): Promise<CognitionContext> {
  const character = await getCharacterById(characterId);
  if (!character) throw new Error(`Character ${characterId} not found`);

  const [dbLore, dbMemories, dbRelationships, dbTimeline, dbHistory, vectorLore] = await Promise.all([
    getLoreByWorldId(worldId, { limit: LORE_RETRIEVAL_LIMIT }),
    db.select().from(memories)
      .where(and(eq(memories.characterId, characterId), eq(memories.isActive, true)))
      .orderBy(desc(memories.importance))
      .limit(MEMORY_LIMIT),
    getRelationshipsForCharacter(characterId, { limit: RELATIONSHIP_LIMIT }),
    listTimelineByCharacter(characterId, { limit: TIMELINE_LIMIT }),
    getChatHistory(sessionId, HISTORY_LIMIT),
    (async () => {
      try {
        const vector = await embedText(userMessage);
        return await searchLore(worldId, vector, LORE_RETRIEVAL_LIMIT);
      } catch {
        return [];
      }
    })(),
  ]);

  const prompt = assemblePrompt({
    characterName: character.name,
    characterPersona: character.personality ?? '',
    characterDescription: character.description ?? '',
    characterRole: character.role ?? '',
    lore: vectorLore.length > 0
      ? vectorLore.map((h) => `[${h.payload.title}] ${h.payload.chunkText}`)
      : dbLore.map((l) => `[${l.title}] ${l.content.slice(0, 300)}`),
    memories: dbMemories.map((m) => m.content),
    relationships: dbRelationships.map((r) => `To character ${r.toCharacterId}: trust=${r.trust}, respect=${r.respect}, affection=${r.affection}, notes=${r.notes ?? ''}`),
    timeline: dbTimeline.map((t) => `[${t.happenedAt}] ${t.title}: ${t.description ?? ''}`),
    history: dbHistory.map((h) => `${h.role}: ${h.content}`),
  }, userMessage);

  return {
    character,
    prompt,
    retrievedLore: vectorLore,
    dbLore,
    retrievedMemories: dbMemories,
    relationships: dbRelationships,
    timeline: dbTimeline,
    history: dbHistory,
    aiMode: openai ? 'live' : 'simulated',
  };
}

export async function buildChatContext(characterId: number, worldId: number, userMessage: string, sessionId: number): Promise<ChatContext> {
  const cognition = await buildCognitionContext(characterId, worldId, userMessage, sessionId);
  return {
    characterName: cognition.character?.name ?? '',
    characterPersona: cognition.character?.personality ?? '',
    characterDescription: cognition.character?.description ?? '',
    characterRole: cognition.character?.role ?? '',
    lore: cognition.retrievedLore.length > 0
      ? cognition.retrievedLore.map((h) => `[${h.payload.title}] ${h.payload.chunkText}`)
      : cognition.dbLore.map((l) => `[${l.title}] ${l.content.slice(0, 300)}`),
    memories: cognition.retrievedMemories.map((m) => m.content),
    relationships: cognition.relationships.map((r) => `To character ${r.toCharacterId}: trust=${r.trust}, respect=${r.respect}, affection=${r.affection}, notes=${r.notes ?? ''}`),
    timeline: cognition.timeline.map((t) => `[${t.happenedAt}] ${t.title}: ${t.description ?? ''}`),
    history: cognition.history.map((h) => `${h.role}: ${h.content}`),
  };
}

function assemblePrompt(context: ChatContext, userMessage: string): string {
  const parts: string[] = [];

  parts.push(`SYSTEM
You are ${context.characterName}, a character in a story universe.`);

  if (context.characterPersona) {
    parts.push(`Personality: ${context.characterPersona}`);
  }
  if (context.characterDescription) {
    parts.push(`Description: ${context.characterDescription}`);
  }
  if (context.characterRole) {
    parts.push(`Role: ${context.characterRole}`);
  }

  if (context.lore.length > 0) {
    parts.push(`\nRELEVANT LORE\n${context.lore.join('\n')}`);
  }
  if (context.memories.length > 0) {
    parts.push(`\nMEMORIES\n${context.memories.join('\n')}`);
  }
  if (context.relationships.length > 0) {
    parts.push(`\nRELATIONSHIPS\n${context.relationships.join('\n')}`);
  }
  if (context.timeline.length > 0) {
    parts.push(`\nTIMELINE EVENTS\n${context.timeline.join('\n')}`);
  }
  if (context.history.length > 0) {
    parts.push(`\nCONVERSATION HISTORY\n${context.history.slice(-6).join('\n')}`);
  }

  parts.push(`\nTASK\nRespond in character to the user's message. Stay true to your personality and knowledge. Keep responses concise (1-3 paragraphs).\n`);
  parts.push(`USER\n${userMessage}`);

  return parts.join('\n');
}

function chunkText(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let chunk = '';
  let wordCount = 0;

  for (const part of words) {
    chunk += part;
    if (part.trim()) {
      wordCount += 1;
    }
    if (wordCount >= wordsPerChunk) {
      chunks.push(chunk);
      chunk = '';
      wordCount = 0;
    }
  }

  if (chunk) {
    chunks.push(chunk);
  }

  return chunks;
}

export interface StreamEvent {
  type: 'retrieved' | 'token' | 'done' | 'error';
  content?: string;
  lore?: SearchHit[];
  memories?: Array<{ content: string; importance: number }>;
  cognition?: CognitionSnapshot;
  sessionId?: number;
  effects?: PostChatEffects;
  error?: string;
}

export interface PostChatEffects {
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

export async function* streamCharacterChat(
  characterId: number,
  worldId: number,
  userMessage: string,
  sessionId?: number | null,
  userId?: number | null,
): AsyncGenerator<StreamEvent> {
  let session: { id: number };
  if (sessionId != null) {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
    if (existing.length > 0 && existing[0].characterId === characterId) {
      session = existing[0];
    } else {
      session = await getOrCreateSession(characterId, worldId, userId);
    }
  } else {
    session = await getOrCreateSession(characterId, worldId, userId);
  }

  await saveMessage(session.id, 'user', userMessage);

  const cognition = await buildCognitionContext(characterId, worldId, userMessage, session.id);

  yield {
    type: 'retrieved',
    lore: cognition.retrievedLore,
    memories: cognition.retrievedMemories.map((m) => ({ content: m.content, importance: m.importance })),
    cognition: toCognitionSnapshot(cognition),
  };

  let reply: string;

  if (openai && cognition.aiMode === 'live') {
    const stream = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        { role: 'system', content: cognition.prompt.split('\nTASK\n')[0] },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 800,
      temperature: 0.8,
      stream: true,
    });

    reply = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? '';
      if (token) {
        reply += token;
        yield { type: 'token', content: token };
      }
    }
  } else {
    reply = `[No OPENAI_API_KEY configured - simulated response]\n\nHello. I am ${cognition.character?.name ?? 'the character'}. You asked: "${userMessage}".\n\nWhat rises from the archive: ${cognition.retrievedLore.length > 0 ? cognition.retrievedLore.slice(0, 2).map((h) => h.payload.chunkText).join('; ') : cognition.dbLore.slice(0, 2).map((l) => l.title).join('; ')}`;
    for (const token of chunkText(reply, 18)) {
      yield { type: 'token', content: token };
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
  }

  await saveMessage(session.id, 'assistant', reply);

  const effects = await processPostChatEffects(characterId, session.id, userMessage, reply);

  yield { type: 'done', sessionId: session.id, effects };
}

export async function sendCharacterChat(
  characterId: number,
  worldId: number,
  userMessage: string,
  sessionId?: number | null,
  userId?: number | null,
): Promise<{ reply: string; sessionId: number }> {
  let session: { id: number };
  if (sessionId != null) {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
    if (existing.length > 0 && existing[0].characterId === characterId) {
      session = existing[0];
    } else {
      session = await getOrCreateSession(characterId, worldId, userId);
    }
  } else {
    session = await getOrCreateSession(characterId, worldId, userId);
  }

  await saveMessage(session.id, 'user', userMessage);

  const context = await buildChatContext(characterId, worldId, userMessage, session.id);
  const prompt = assemblePrompt(context, userMessage);

  let reply: string;

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        { role: 'system', content: prompt.split('\nTASK\n')[0] },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 800,
      temperature: 0.8,
    });
    reply = completion.choices[0]?.message?.content ?? '...';
  } else {
    reply = `[No OPENAI_API_KEY configured — simulated response]\n\nHello! I am ${context.characterName}. You asked: "${userMessage}".\n\nHere's what I know about my world: ${context.lore.slice(0, 2).join('; ')}`;
  }

  await saveMessage(session.id, 'assistant', reply);

  processPostChatEffects(characterId, session.id, userMessage, reply).catch((err) => {
    console.error('Post-chat effects error:', err);
  });

  return { reply, sessionId: session.id };
}

const TIMELINE_DEDUP_MINUTES = 5;
const MEMORY_DEDUP_HOURS = 24;

async function hasRecentTimelineEvent(characterId: number, title: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - TIMELINE_DEDUP_MINUTES * 60_000);
  const recent = await db.select().from(timelineEvents)
    .where(and(
      eq(timelineEvents.characterId, characterId),
      eq(timelineEvents.title, title),
      gte(timelineEvents.createdAt, cutoff),
    ))
    .limit(1);
  return recent.length > 0;
}

async function processPostChatEffects(
  characterId: number,
  sessionId: number,
  userMessage: string,
  assistantReply: string,
): Promise<PostChatEffects> {
  const fullText = `${userMessage} ${assistantReply}`;
  const summary = extractSummary(fullText);

  // Relationship scoring for existing character-to-character relationships
  const delta = scoreChatRelationship(fullText);
  const existingRels = await getRelationshipsForCharacter(characterId);
  const relationshipUpdates: PostChatEffects['relationshipUpdates'] = [];

  for (const rel of existingRels) {
    await updateRelationshipScores(rel.id, delta);
    relationshipUpdates.push({
      toCharacterId: rel.toCharacterId,
      trustDelta: delta.trust,
      respectDelta: delta.respect,
      affectionDelta: delta.affection,
      rivalryDelta: delta.rivalry,
      fearDelta: delta.fear,
      alignmentDelta: delta.alignment,
    });
  }

  // Timeline event generation with dedup
  let timelineCreated = false;
  if (summary.significance >= 2) {
    const title = `Conversation: ${summary.topic}`;
    const exists = await hasRecentTimelineEvent(characterId, title);
    if (!exists) {
      await createTimelineEvent({
        characterId,
        title,
        description: fullText.slice(0, 500),
        eventType: 'interaction',
        happenedAt: new Date(),
        significance: summary.significance,
      });
      timelineCreated = true;
    }
  }

  // Memory extraction with dedup
  let memoryCreated = false;
  if (summary.significance >= 3) {
    const memoryContent = `Learned about ${summary.topic}: "${userMessage.slice(0, 200)}"`;
    const recent = await db.select().from(memories)
      .where(and(
        eq(memories.characterId, characterId),
        eq(memories.content, memoryContent),
        gte(memories.createdAt, new Date(Date.now() - MEMORY_DEDUP_HOURS * 60 * 60_000)),
      ))
      .limit(1);
    if (recent.length === 0) {
      await db.insert(memories).values({
        characterId,
        content: memoryContent,
        importance: clampScore(summary.significance / 5, 0, 1),
        isActive: true,
        metadata: { source: 'chat', sessionId },
      });
      memoryCreated = true;
    }
  }

  return {
    timelineCreated,
    memoryCreated,
    topic: summary.topic,
    relationshipUpdates,
  };
}
