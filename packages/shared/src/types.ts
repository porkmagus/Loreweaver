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
  baseUrl?: string;
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

// Image provider
export type ImageProviderType = 'openai-image' | 'custom-image-endpoint' | 'disabled';

export interface ImageProviderConfig {
  provider: ImageProviderType;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  size?: string;
  quality?: string;
  format?: string;
  enabled: boolean;
}

export interface ImageProviderStatus {
  ok: boolean;
  provider: string;
  model?: string;
  error?: string;
  warning?: string;
}
