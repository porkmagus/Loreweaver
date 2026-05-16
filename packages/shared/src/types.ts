export interface AppConfig {
  apiPort: number;
  apiHost: string;
  webPort: number;
  databaseUrl: string;
  qdrantUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

export type ProviderType = 'custom-openai' | 'ollama' | 'openrouter';

export interface ProviderConfig {
  provider: ProviderType;
  baseUrl: string;
  apiKey?: string;
  chatModel: string;
  embeddingModel?: string;
  imageModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderStatus {
  ok: boolean;
  provider: string;
  streaming: boolean;
  model?: string;
  error?: string;
}
