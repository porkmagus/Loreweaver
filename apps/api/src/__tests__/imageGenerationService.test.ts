import { afterEach, describe, expect, it, vi } from 'vitest';

describe('imageGenerationService', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns deterministic fallback assets when image generation is disabled', async () => {
    vi.stubEnv('IMAGE_GENERATION_ENABLED', 'false');
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    vi.resetModules();

    const { generateCharacterPortrait, generateWorldBanner } = await import('../services/imageGenerationService.js');

    const banner = await generateWorldBanner({
      name: 'The Lantern Archive',
      description: 'A sealed archive beneath a rain-dark city.',
      genre: 'dark fantasy',
      themes: ['memory', 'inheritance'],
    });
    const portrait = await generateCharacterPortrait({
      worldName: 'The Lantern Archive',
      worldGenre: 'dark fantasy',
      worldDescription: 'A sealed archive beneath a rain-dark city.',
      name: 'Mara Vey',
      description: 'The last living indexer of a forbidden archive.',
      role: 'Archivist',
      personality: 'watchful, warm, haunted',
    });

    expect(banner).toMatchObject({
      kind: 'world-banner',
      status: 'fallback',
      provider: 'deterministic',
    });
    expect(portrait).toMatchObject({
      kind: 'character-portrait',
      status: 'fallback',
      provider: 'deterministic',
    });
    expect(banner.imageUrl).toContain('data:image/svg+xml');
    expect(portrait.imageUrl).toContain('data:image/svg+xml');
  });
});
