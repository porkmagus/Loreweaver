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
      status: 'disabled',
      provider: 'deterministic',
    });
    expect(portrait).toMatchObject({
      kind: 'character-portrait',
      status: 'disabled',
      provider: 'deterministic',
    });
    expect(banner.imageUrl).toContain('data:image/svg+xml');
    expect(portrait.imageUrl).toContain('data:image/svg+xml');

    // Verify portrait SVG is clean and symmetrical (no glitchy half-shading artifacts)
    const portraitSvg = decodeURIComponent(portrait.imageUrl.replace('data:image/svg+xml;utf8,', ''));
    expect(portraitSvg).toContain('<svg');
    expect(portraitSvg).toContain('</svg>');
    // Should contain a centered head circle with visible fill
    expect(portraitSvg).toContain('fill="#161821"');
    // Should not contain the old dark glitchy body path fill
    expect(portraitSvg).not.toContain('fill="#111318"');
    // Should contain initials text centered with dy
    expect(portraitSvg).toContain('text-anchor="middle"');
    expect(portraitSvg).toContain('dy="0.35em"');
  });
});
