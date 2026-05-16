import { eq, and, desc, isNull, gte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { chatSessions, chatMessages, memories, timelineEvents } from '../db/schema.js';
import { getCharacterById } from './characterService.js';
import { getLoreByWorldId } from './loreService.js';
import { getRelationshipsForCharacter, getOrCreateRelationship, updateRelationshipScores } from './relationshipService.js';
import { listTimelineByCharacter, createTimelineEvent } from './timelineService.js';
import { embedText } from './embedding.js';
import { searchLore } from './qdrant.js';
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

export async function buildChatContext(characterId: number, worldId: number, userMessage: string, sessionId: number): Promise<ChatContext> {
  const [character] = await Promise.all([
    getCharacterById(characterId),
  ]);

  if (!character) throw new Error(`Character ${characterId} not found`);

  // Parallel retrieval
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

  return {
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

  // Post-chat: non-blocking relationship scoring, timeline event, memory extraction
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
) {
  const fullText = `${userMessage} ${assistantReply}`;

  // Relationship scoring between characters only (user proxy not stored due to FK constraint)
  const delta = scoreChatRelationship(fullText);
  // Only update if there are other characters in the world; user proxy (id=0) is skipped
  // because relationships.to_character_id references characters.id and is NOT NULL.

  // Timeline event generation with dedup
  const summary = extractSummary(fullText);
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
    }
  }

  // Memory extraction with dedup
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
    }
  }
}
