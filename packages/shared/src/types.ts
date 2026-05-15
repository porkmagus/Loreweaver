export interface AppConfig {
  apiPort: number;
  apiHost: string;
  webPort: number;
  databaseUrl: string;
  qdrantUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}
