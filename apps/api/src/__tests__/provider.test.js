import { describe, it, expect, vi, beforeEach } from 'vitest';
describe('provider.ts', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });
    it('custom-openai with empty baseUrl resolves to official endpoint', async () => {
        vi.stubEnv('AI_BASE_URL', '');
        vi.stubEnv('AI_CHAT_MODEL', 'gpt-4o-mini');
        vi.stubEnv('AI_PROVIDER', 'custom-openai');
        vi.resetModules();
        const { resolveProviderConfig, setRuntimeProviderConfig } = await import('../services/provider.js');
        setRuntimeProviderConfig({ provider: 'custom-openai', baseUrl: '', chatModel: 'gpt-4o-mini' });
        const cfg = resolveProviderConfig();
        expect(cfg.baseUrl).toBe('');
        expect(cfg.provider).toBe('custom-openai');
    });
    it('ollama with empty baseUrl defaults to localhost', async () => {
        vi.stubEnv('AI_BASE_URL', '');
        vi.stubEnv('AI_CHAT_MODEL', 'llama3.1');
        vi.stubEnv('AI_PROVIDER', 'ollama');
        vi.resetModules();
        const { resolveProviderConfig } = await import('../services/provider.js');
        const cfg = resolveProviderConfig();
        expect(cfg.baseUrl).toBe('http://localhost:11434');
        expect(cfg.provider).toBe('ollama');
    });
    it('openrouter with empty baseUrl defaults to openrouter endpoint', async () => {
        vi.stubEnv('AI_BASE_URL', '');
        vi.stubEnv('AI_CHAT_MODEL', 'qwen/qwen3-coder');
        vi.stubEnv('AI_PROVIDER', 'openrouter');
        vi.resetModules();
        const { resolveProviderConfig } = await import('../services/provider.js');
        const cfg = resolveProviderConfig();
        expect(cfg.baseUrl).toBe('https://openrouter.ai/api/v1');
        expect(cfg.provider).toBe('openrouter');
    });
    it('clearing baseUrl persists as empty string and overrides env', async () => {
        vi.stubEnv('AI_BASE_URL', 'http://localhost:1234/v1');
        vi.stubEnv('AI_CHAT_MODEL', 'gpt-4o-mini');
        vi.stubEnv('AI_PROVIDER', 'custom-openai');
        vi.resetModules();
        const { resolveProviderConfig, setRuntimeProviderConfig } = await import('../services/provider.js');
        setRuntimeProviderConfig({ baseUrl: '', chatModel: 'gpt-4o-mini' });
        const cfg = resolveProviderConfig();
        expect(cfg.baseUrl).toBe('');
    });
    it('test function uses submitted form config with empty baseUrl', async () => {
        vi.stubEnv('AI_BASE_URL', 'http://localhost:1234/v1');
        vi.stubEnv('AI_API_KEY', 'test-key');
        vi.stubEnv('AI_CHAT_MODEL', 'gpt-4o-mini');
        vi.stubEnv('AI_PROVIDER', 'custom-openai');
        vi.resetModules();
        const { resolveProviderConfig } = await import('../services/provider.js');
        const formConfig = { provider: 'custom-openai', baseUrl: '', apiKey: '', chatModel: 'gpt-4o-mini' };
        const cfg = resolveProviderConfig(formConfig);
        expect(cfg.baseUrl).toBe('');
        expect(cfg.apiKey).toBe('');
    });
});
//# sourceMappingURL=provider.test.js.map