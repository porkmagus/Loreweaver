import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { appSettings } from '../db/schema.js';
import type { ProviderConfig } from './provider.js';
import type { ImageProviderConfig } from '@loreweaver/shared';

const AI_SETTINGS_KEY = 'ai_provider';
const IMAGE_SETTINGS_KEY = 'image_provider';

export async function getPersistedProviderConfig(): Promise<Partial<ProviderConfig> | null> {
  try {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, AI_SETTINGS_KEY)).limit(1);
    if (rows.length === 0) return null;
    const value = rows[0].value as Partial<ProviderConfig> | null;
    return value;
  } catch {
    return null;
  }
}

export async function setPersistedProviderConfig(config: Partial<ProviderConfig>): Promise<void> {
  const value = { ...config };
  await db.insert(appSettings)
    .values({ key: AI_SETTINGS_KEY, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function getPersistedImageProviderConfig(): Promise<Partial<ImageProviderConfig> | null> {
  try {
    const rows = await db.select().from(appSettings).where(eq(appSettings.key, IMAGE_SETTINGS_KEY)).limit(1);
    if (rows.length === 0) return null;
    const value = rows[0].value as Partial<ImageProviderConfig> | null;
    return value;
  } catch {
    return null;
  }
}

export async function setPersistedImageProviderConfig(config: Partial<ImageProviderConfig>): Promise<void> {
  const value = { ...config };
  await db.insert(appSettings)
    .values({ key: IMAGE_SETTINGS_KEY, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}
