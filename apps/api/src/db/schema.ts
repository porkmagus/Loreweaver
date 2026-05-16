import { pgTable, serial, varchar, text, integer, timestamp, jsonb, real, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const worlds = pgTable('worlds', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  genre: varchar('genre', { length: 100 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('worlds_name_idx').on(table.name),
]);

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  personality: text('personality'),
  role: varchar('role', { length: 100 }),
  isPlayer: boolean('is_player').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('characters_world_id_idx').on(table.worldId),
  index('characters_name_idx').on(table.name),
]);

export const loreEntries = pgTable('lore_entries', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  tags: text('tags'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('lore_world_id_idx').on(table.worldId),
]);

export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  importance: real('importance').default(1.0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('memories_character_id_idx').on(table.characterId),
]);

export const relationships = pgTable('relationships', {
  id: serial('id').primaryKey(),
  fromCharacterId: integer('from_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  toCharacterId: integer('to_character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  trust: real('trust').default(0).notNull(),
  respect: real('respect').default(0).notNull(),
  affection: real('affection').default(0).notNull(),
  rivalry: real('rivalry').default(0).notNull(),
  fear: real('fear').default(0).notNull(),
  alignment: real('alignment').default(0).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('rel_from_idx').on(table.fromCharacterId),
  index('rel_to_idx').on(table.toCharacterId),
]);

export const timelineEvents = pgTable('timeline_events', {
  id: serial('id').primaryKey(),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  significance: integer('significance').default(1).notNull(),
  happenedAt: timestamp('happened_at', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('timeline_char_id_idx').on(table.characterId),
]);

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  worldId: integer('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('session_char_id_idx').on(table.characterId),
]);

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('msg_session_id_idx').on(table.sessionId),
]);

// Relations
export const worldsRelations = relations(worlds, ({ many }) => ({
  characters: many(characters),
  loreEntries: many(loreEntries),
  chatSessions: many(chatSessions),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  world: one(worlds, { fields: [characters.worldId], references: [worlds.id] }),
  memories: many(memories),
  timelineEvents: many(timelineEvents),
  outgoingRelationships: many(relationships, { relationName: 'fromCharacter' }),
  incomingRelationships: many(relationships, { relationName: 'toCharacter' }),
  chatSessions: many(chatSessions),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  character: one(characters, { fields: [memories.characterId], references: [characters.id] }),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  character: one(characters, { fields: [timelineEvents.characterId], references: [characters.id] }),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
  fromCharacter: one(characters, { fields: [relationships.fromCharacterId], references: [characters.id] }),
  toCharacter: one(characters, { fields: [relationships.toCharacterId], references: [characters.id] }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  world: one(worlds, { fields: [chatSessions.worldId], references: [worlds.id] }),
  character: one(characters, { fields: [chatSessions.characterId], references: [characters.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, { fields: [chatMessages.sessionId], references: [chatSessions.id] }),
}));
