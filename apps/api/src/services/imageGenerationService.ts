import {
  resolveImageProviderConfig,
  generateImage,
  type GenerateImageResult,
} from './imageProvider.js';

const imageTimeoutMs = Number(process.env.IMAGE_GENERATION_TIMEOUT_MS ?? 20_000);

export type VisualAssetKind = 'world-banner' | 'character-portrait';
export type VisualAssetStatus = 'generated' | 'fallback' | 'failed' | 'disabled' | 'generating';

export interface VisualAsset {
  kind: VisualAssetKind;
  status: VisualAssetStatus;
  provider: 'openai-image' | 'custom-image-endpoint' | 'deterministic';
  imageUrl: string;
  prompt: string;
  model?: string;
  reason?: string;
  generatedAt: string;
}

export interface VisualMetadata {
  visual?: {
    banner?: VisualAsset;
    portrait?: VisualAsset;
  };
}

interface WorldVisualInput {
  name: string;
  description: string;
  genre: string;
  themes: string[];
}

interface CharacterVisualInput {
  worldName: string;
  worldGenre: string;
  worldDescription: string;
  name: string;
  description: string;
  personality: string;
  role: string;
}

export async function generateWorldBanner(input: WorldVisualInput): Promise<VisualAsset> {
  const prompt = buildWorldBannerPrompt(input);
  return generateVisualAsset({
    kind: 'world-banner',
    prompt,
    fallbackSeed: `${input.name}:${input.genre}:${input.themes.join(',')}`,
    fallbackLabel: input.name,
    size: '1536x1024',
  });
}

export function createFallbackWorldBanner(input: WorldVisualInput, reason = 'legacy visual fallback'): VisualAsset {
  const prompt = buildWorldBannerPrompt(input);
  return deterministicVisualAsset(
    'world-banner',
    prompt,
    `${input.name}:${input.genre}:${input.themes.join(',')}`,
    input.name,
    input.genre,
    reason,
  );
}

export async function generateCharacterPortrait(input: CharacterVisualInput): Promise<VisualAsset> {
  const prompt = buildCharacterPortraitPrompt(input);
  return generateVisualAsset({
    kind: 'character-portrait',
    prompt,
    fallbackSeed: `${input.worldName}:${input.name}:${input.role}`,
    fallbackLabel: input.name,
    fallbackSubLabel: input.role,
    size: '1024x1024',
  });
}

export function createFallbackCharacterPortrait(input: CharacterVisualInput, reason = 'legacy visual fallback'): VisualAsset {
  const prompt = buildCharacterPortraitPrompt(input);
  return deterministicVisualAsset(
    'character-portrait',
    prompt,
    `${input.worldName}:${input.name}:${input.role}`,
    input.name,
    input.role,
    reason,
  );
}

function buildWorldBannerPrompt(input: WorldVisualInput): string {
  return [
    'Create an atmospheric cinematic world banner for a narrative archive application.',
    `World: ${input.name}`,
    `Genre: ${input.genre || 'speculative fiction'}`,
    `Description: ${input.description}`,
    input.themes.length > 0 ? `Themes: ${input.themes.join(', ')}` : '',
    'Visual style: restrained painterly realism, dark codex/archive mood, premium fantasy or science fiction concept art, subtle gold and ember accents, atmospheric depth, readable silhouette.',
    'Composition: wide environmental banner, no UI, no text, no logos, no watermark, not anime, not neon cyberpunk, not a noisy collage.',
  ].filter(Boolean).join('\n');
}

function buildCharacterPortraitPrompt(input: CharacterVisualInput): string {
  return [
    'Create a memorable cinematic character portrait for a narrative archive application.',
    `World: ${input.worldName} (${input.worldGenre || 'speculative fiction'})`,
    `World atmosphere: ${input.worldDescription}`,
    `Character: ${input.name}`,
    `Role: ${input.role || 'notable persona'}`,
    `Description: ${input.description}`,
    `Personality: ${input.personality}`,
    'Visual style: restrained painterly portrait, dark fantasy or science fiction realism, emotionally grounded, dignified, subtle dramatic lighting, archival codex atmosphere.',
    'Composition: bust or half-body portrait, direct identity read, no UI, no text, no logos, no watermark, not anime, not hypersexualized, not a generic AI headshot.',
  ].filter(Boolean).join('\n');
}

async function generateVisualAsset({
  kind,
  prompt,
  fallbackSeed,
  fallbackLabel,
  fallbackSubLabel,
  size,
}: {
  kind: VisualAssetKind;
  prompt: string;
  fallbackSeed: string;
  fallbackLabel: string;
  fallbackSubLabel?: string;
  size: '1024x1024' | '1536x1024';
}): Promise<VisualAsset> {
  const config = resolveImageProviderConfig();

  if (!config.enabled || config.provider === 'disabled') {
    return deterministicVisualAsset(kind, prompt, fallbackSeed, fallbackLabel, fallbackSubLabel, 'image generation disabled', 'disabled');
  }

  try {
    const result = await withTimeout(
      generateImage(config, { prompt, size }),
      imageTimeoutMs,
      'image generation timed out',
    );

    if (result.imageUrl) {
      return {
        kind,
        status: 'generated',
        provider: config.provider === 'custom-image-endpoint' ? 'custom-image-endpoint' : 'openai-image',
        imageUrl: result.imageUrl,
        prompt,
        model: result.model,
        generatedAt: new Date().toISOString(),
      };
    }

    // Provider returned no image — fall back deterministically
    return deterministicVisualAsset(
      kind,
      prompt,
      fallbackSeed,
      fallbackLabel,
      fallbackSubLabel,
      result.error ?? 'image provider returned no image',
      'failed',
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'image generation failed';
    return deterministicVisualAsset(kind, prompt, fallbackSeed, fallbackLabel, fallbackSubLabel, reason, 'failed');
  }
}

function deterministicVisualAsset(
  kind: VisualAssetKind,
  prompt: string,
  seed: string,
  label: string,
  subLabel?: string,
  reason = 'image generation unavailable',
  status: VisualAssetStatus = 'fallback',
): VisualAsset {
  return {
    kind,
    status,
    provider: 'deterministic',
    imageUrl: kind === 'world-banner'
      ? makeWorldBannerDataUri(seed, label, subLabel)
      : makePortraitDataUri(seed, label, subLabel),
    prompt,
    reason,
    generatedAt: new Date().toISOString(),
  };
}

function makeWorldBannerDataUri(seed: string, label: string, subLabel?: string): string {
  const palette = paletteFromSeed(seed);
  const safeLabel = escapeXml(label);
  const safeSubLabel = escapeXml(subLabel ?? 'visual fallback');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1024" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/>
      <stop offset="0.55" stop-color="#111318"/>
      <stop offset="1" stop-color="${palette[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0" stop-color="${palette[2]}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <rect width="1536" height="1024" fill="url(#glow)"/>
  <path d="M0 760 C240 680 366 730 560 650 C760 568 930 530 1148 604 C1300 656 1408 700 1536 650 L1536 1024 L0 1024 Z" fill="#0A0B0F" opacity="0.72"/>
  <path d="M116 720 C286 642 408 656 562 584 C780 482 1002 492 1216 570 C1364 624 1450 620 1536 586" fill="none" stroke="${palette[2]}" stroke-opacity="0.34" stroke-width="3"/>
  <circle cx="1190" cy="258" r="108" fill="${palette[2]}" opacity="0.11"/>
  <text x="96" y="820" fill="#E8E4DC" font-family="Georgia, serif" font-size="88" font-weight="400">${safeLabel}</text>
  <text x="100" y="876" fill="#A8A29E" font-family="Inter, Arial, sans-serif" font-size="28" letter-spacing="6">${safeSubLabel.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makePortraitDataUri(seed: string, label: string, subLabel?: string): string {
  const palette = paletteFromSeed(seed);
  const initials = escapeXml(label.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LW');
  const safeSubLabel = escapeXml(subLabel ?? 'persona');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/>
      <stop offset="1" stop-color="#0A0B0F"/>
    </linearGradient>
    <radialGradient id="aura" cx="50%" cy="30%" r="62%">
      <stop offset="0" stop-color="${palette[2]}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#aura)"/>
  <circle cx="512" cy="382" r="170" fill="#181A21" stroke="${palette[2]}" stroke-opacity="0.5" stroke-width="6"/>
  <path d="M240 900 C280 690 372 594 512 594 C652 594 744 690 784 900 Z" fill="#111318" stroke="#2D303A" stroke-width="5"/>
  <text x="512" y="422" text-anchor="middle" fill="#E8E4DC" font-family="Georgia, serif" font-size="124">${initials}</text>
  <text x="512" y="812" text-anchor="middle" fill="#A8A29E" font-family="Inter, Arial, sans-serif" font-size="34" letter-spacing="5">${safeSubLabel.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function paletteFromSeed(seed: string): [string, string, string] {
  const palettes: Array<[string, string, string]> = [
    ['#111318', '#2D1F22', '#C9A96E'],
    ['#10161A', '#172923', '#5A7A6A'],
    ['#15131C', '#251C30', '#7B6B9A'],
    ['#111318', '#2A1B16', '#8B5A3C'],
    ['#10151D', '#162232', '#5E6B7A'],
  ];
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&' + 'amp;')
    .replace(/</g, '&' + 'lt;')
    .replace(/>/g, '&' + 'gt;')
    .replace(/"/g, '&' + 'quot;')
    .replace(/'/g, '&' + '#39;');
}

async function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms)),
  ]);
}
