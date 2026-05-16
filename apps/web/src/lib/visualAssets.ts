export type VisualAssetStatus = 'generated' | 'fallback' | 'failed' | 'disabled';

export interface VisualAsset {
  kind: 'world-banner' | 'character-portrait';
  status: VisualAssetStatus;
  provider: 'openai' | 'deterministic';
  imageUrl: string;
  prompt?: string;
  model?: string;
  reason?: string;
  generatedAt?: string;
}

interface VisualMetadata {
  visual?: {
    banner?: VisualAsset;
    portrait?: VisualAsset;
  };
}

export function getWorldBanner(metadata: unknown): VisualAsset | null {
  return readVisualMetadata(metadata)?.visual?.banner ?? null;
}

export function getCharacterPortrait(metadata: unknown): VisualAsset | null {
  return readVisualMetadata(metadata)?.visual?.portrait ?? null;
}

export function visualStatusLabel(asset: VisualAsset | null): string {
  if (!asset) return 'visual pending';
  if (asset.status === 'generated') return 'generated image';
  if (asset.status === 'failed') return 'failed · fallback';
  if (asset.status === 'disabled') return 'disabled';
  return 'fallback image';
}

export function visualStatusShort(asset: VisualAsset | null): string {
  if (!asset) return 'pending';
  if (asset.status === 'generated') return 'generated';
  if (asset.status === 'failed') return 'failed';
  if (asset.status === 'disabled') return 'disabled';
  return 'fallback';
}

function readVisualMetadata(metadata: unknown): VisualMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  return metadata as VisualMetadata;
}
