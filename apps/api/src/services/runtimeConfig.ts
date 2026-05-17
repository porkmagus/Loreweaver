import {
  getEnvProviderConfig,
  setRuntimeProviderConfig,
  resolveProviderConfig,
  hasLiveProvider,
  type ProviderConfig,
} from './provider.js';
import {
  getEnvImageProviderConfig,
  setRuntimeImageProviderConfig,
  resolveImageProviderConfig,
} from './imageProvider.js';
import type { ImageProviderConfig } from '@loreweaver/shared';
import {
  getPersistedProviderConfig,
  setPersistedProviderConfig,
  getPersistedImageProviderConfig,
  setPersistedImageProviderConfig,
} from './appSettings.js';

export type ResolvedConfig = {
  provider: ProviderConfig;
  imageProvider: ImageProviderConfig;
  simulated: boolean;
};

let cachedConfig: ResolvedConfig | null = null;

export async function loadPersistedConfig(): Promise<ResolvedConfig> {
  const persistedProvider = await getPersistedProviderConfig();
  const persistedImage = await getPersistedImageProviderConfig();

  if (persistedProvider) {
    setRuntimeProviderConfig(persistedProvider);
  }
  if (persistedImage) {
    setRuntimeImageProviderConfig(persistedImage);
  }

  const provider = resolveProviderConfig();
  const imageProvider = resolveImageProviderConfig();
  const simulated = !hasLiveProvider(provider);

  cachedConfig = { provider, imageProvider, simulated };
  return cachedConfig;
}

export function getResolvedConfig(): ResolvedConfig {
  if (cachedConfig) return cachedConfig;
  const provider = resolveProviderConfig();
  const imageProvider = resolveImageProviderConfig();
  const simulated = !hasLiveProvider(provider);
  return { provider, imageProvider, simulated };
}

export async function updateProviderConfig(config: Partial<ProviderConfig>): Promise<ProviderConfig> {
  setRuntimeProviderConfig(config);
  await setPersistedProviderConfig(config);
  const resolved = resolveProviderConfig();
  refreshCache();
  return resolved;
}

export async function updateImageProviderConfig(config: Partial<ImageProviderConfig>): Promise<ImageProviderConfig> {
  setRuntimeImageProviderConfig(config);
  await setPersistedImageProviderConfig(config);
  const resolved = resolveImageProviderConfig();
  refreshCache();
  return resolved;
}

function refreshCache(): void {
  const provider = resolveProviderConfig();
  const imageProvider = resolveImageProviderConfig();
  const simulated = !hasLiveProvider(provider);
  cachedConfig = { provider, imageProvider, simulated };
}
