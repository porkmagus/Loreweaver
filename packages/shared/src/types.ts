export interface AppConfig {
  apiPort: number;
  apiHost: string;
  webPort: number;
  databaseUrl: string;
  qdrantUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

export interface World {
  id: number;
  name: string;
  description: string | null;
  genre: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: number;
  worldId: number;
  name: string;
  description: string | null;
  personality: string | null;
  role: string | null;
  isPlayer: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: number;
  worldId: number;
  title: string;
  content: string;
  category: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: number;
  characterId: number;
  title: string;
  description: string | null;
  eventType: string;
  happenedAt: string;
  significance: number;
  createdAt: string;
}

export interface HealthResponse {
  status: 'ok' | 'healthy' | 'degraded' | 'unhealthy';
  timestamp?: string;
  version: string;
  aiMode?: 'live' | 'simulated';
  qdrantConnected?: boolean;
  embeddingAvailable?: boolean;
  embeddingModel?: string;
}
