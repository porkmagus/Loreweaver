import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { apiPost, useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import {
  Server,
  Key,
  MessageSquare,
  Layers,
  Image,
  Gauge,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Plug,
  RotateCw,
  Paintbrush,
  type LucideIcon,
} from 'lucide-react';
import type { ProviderConfig, ProviderStatus, ImageProviderConfig, ImageProviderStatus } from '@loreweaver/shared';

const STORAGE_KEY = 'loreweaver-provider-config-draft';
const IMAGE_STORAGE_KEY = 'loreweaver-image-provider-config-draft';

// ── Text Provider presets ───────────────────────────────────────
interface TextPreset {
  label: string;
  value: ProviderConfig['provider'];
  baseUrl: string;
  chatModel: string;
  embeddingModel: string;
}

const TEXT_PRESETS: TextPreset[] = [
  {
    label: 'Custom OpenAI-Compatible',
    value: 'custom-openai',
    baseUrl: '',
    chatModel: '',
    embeddingModel: '',
  },
  {
    label: 'Ollama Local',
    value: 'ollama',
    baseUrl: 'http://localhost:11434',
    chatModel: '',
    embeddingModel: '',
  },
  {
    label: 'Ollama Cloud / Remote',
    value: 'ollama',
    baseUrl: 'https://www.ollama.com/v1',
    chatModel: '',
    embeddingModel: '',
  },
  {
    label: 'OpenRouter',
    value: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    chatModel: '',
    embeddingModel: '',
  },
];

function matchTextPreset(form: Partial<ProviderConfig>): TextPreset | undefined {
  return TEXT_PRESETS.find((p) => {
    if (form.provider !== p.value) return false;
    const url = (form.baseUrl ?? '').toLowerCase().replace(/\/$/, '');
    const pUrl = p.baseUrl.toLowerCase().replace(/\/$/, '');
    if (p.value === 'ollama') {
      return url === pUrl || (url === '' && pUrl === 'https://www.ollama.com/v1');
    }
    return url === pUrl || url.startsWith(pUrl);
  });
}

// ── Embedding Provider presets ────────────────────────────────────
interface EmbeddingPreset {
  label: string;
  embeddingModel: string;
}

const EMBEDDING_PRESETS: EmbeddingPreset[] = [
  {
    label: 'Same as Text Provider',
    embeddingModel: '',
  },
  {
    label: 'Custom OpenAI-Compatible',
    embeddingModel: 'text-embedding-3-small',
  },
  {
    label: 'Ollama Local',
    embeddingModel: 'nomic-embed-text',
  },
];

// ── Image presets ───────────────────────────────────────────────
const IMAGE_PRESETS: { label: string; value: ImageProviderConfig['provider']; defaults: Partial<ImageProviderConfig> }[] = [
  {
    label: 'OpenAI Image',
    value: 'openai-image',
    defaults: {
      baseUrl: '',
      model: 'gpt-image-2',
      size: '1536x1024',
      quality: 'low',
      format: 'webp',
      enabled: true,
    },
  },
  {
    label: 'Custom Image Endpoint',
    value: 'custom-image-endpoint',
    defaults: {
      baseUrl: '',
      model: '',
      size: '1536x1024',
      quality: 'low',
      format: 'webp',
      enabled: true,
    },
  },
  {
    label: 'Disabled / Fallback Only',
    value: 'disabled',
    defaults: {
      model: '',
      size: '',
      quality: '',
      format: '',
      enabled: false,
    },
  },
];

// ── Draft caching ───────────────────────────────────────────────
function loadDraft(): Partial<ProviderConfig> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ProviderConfig>;
  } catch {
    return null;
  }
}
function saveDraft(config: Partial<ProviderConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
function loadImageDraft(): Partial<ImageProviderConfig> | null {
  try {
    const raw = localStorage.getItem(IMAGE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ImageProviderConfig>;
  } catch {
    return null;
  }
}
function saveImageDraft(config: Partial<ImageProviderConfig>) {
  localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(config));
}

export function Settings() {
  const { data: serverConfig, loading: serverLoading } = useApi<ProviderConfig>('/settings/provider');
  const { data: serverImageConfig, loading: imageServerLoading } = useApi<ImageProviderConfig>('/settings/image-provider');

  const [form, setForm] = useState<Partial<ProviderConfig>>({
    provider: undefined,
    baseUrl: undefined,
    apiKey: undefined,
    chatModel: undefined,
    embeddingModel: undefined,
    temperature: undefined,
    maxTokens: undefined,
  });

  const [imageForm, setImageForm] = useState<Partial<ImageProviderConfig>>({
    provider: undefined,
    baseUrl: undefined,
    apiKey: undefined,
    model: undefined,
    size: undefined,
    quality: undefined,
    format: undefined,
    enabled: undefined,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProviderStatus | null>(null);

  const [imageSaving, setImageSaving] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [imageTesting, setImageTesting] = useState(false);
  const [imageTestResult, setImageTestResult] = useState<ImageProviderStatus | null>(null);
  // Inline one-time hydration: runs synchronously during render.
  // Once user clicks a preset, provider becomes a string → condition fails → hydration stops.
  if (serverConfig && form.provider === undefined) {
    setForm(serverConfig);
  }
  if (serverImageConfig && imageForm.provider === undefined) {
    setImageForm(serverImageConfig);
  }

  const activePreset = matchTextPreset(form);

  const applyPreset = (preset: TextPreset) => {
    setForm((prev: Partial<ProviderConfig>) => ({
      ...prev,
      provider: preset.value,
      baseUrl: preset.baseUrl,
      chatModel: preset.value === 'ollama' ? '' : (preset.chatModel || prev.chatModel || ''),
      embeddingModel: preset.value === 'ollama' ? '' : (preset.embeddingModel || prev.embeddingModel || ''),
      apiKey: preset.value === 'ollama' ? '' : prev.apiKey,
    }));
    setSaved(false);
    setTestResult(null);
  };

  const applyImagePreset = (preset: (typeof IMAGE_PRESETS)[number]) => {
    setImageForm((prev: Partial<ImageProviderConfig>) => ({
      ...prev,
      provider: preset.value,
      baseUrl: preset.defaults.baseUrl ?? '',
      model: preset.defaults.model ?? '',
      size: preset.defaults.size ?? '',
      quality: preset.defaults.quality ?? '',
      format: preset.defaults.format ?? '',
      enabled: preset.defaults.enabled ?? true,
    }));
    setImageSaved(false);
    setImageTestResult(null);
  };

  const updateField = <K extends keyof ProviderConfig>(key: K, value: ProviderConfig[K]) => {
    setForm((prev: Partial<ProviderConfig>) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateImageField = <K extends keyof ImageProviderConfig>(key: K, value: ImageProviderConfig[K]) => {
    setImageForm((prev: Partial<ImageProviderConfig>) => ({ ...prev, [key]: value }));
    setImageSaved(false);
  };

  const handleSave = async () => {
    if (!form.chatModel) return;
    setSaving(true);
    try {
      saveDraft(form);
      const payload: ProviderConfig = {
        provider: form.provider ?? 'custom-openai',
        baseUrl: form.baseUrl ?? '',
        apiKey: form.apiKey ?? '',
        chatModel: form.chatModel,
        embeddingModel: form.embeddingModel ?? '',
        temperature: form.temperature ?? 0.8,
        maxTokens: form.maxTokens ?? 800,
      };
      await apiPost<ProviderConfig>('/settings/provider', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!form.chatModel) return;
    setTesting(true);
    setTestResult(null);
    try {
      const payload: ProviderConfig = {
        provider: form.provider ?? 'custom-openai',
        baseUrl: form.baseUrl ?? '',
        apiKey: form.apiKey ?? '',
        chatModel: form.chatModel,
        embeddingModel: form.embeddingModel ?? '',
        temperature: form.temperature ?? 0.8,
        maxTokens: form.maxTokens ?? 800,
      };
      const res = await apiPost<ProviderStatus>('/settings/provider/test', payload);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        ok: false,
        provider: form.provider ?? 'unknown',
        streaming: false,
        error: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleImageSave = async () => {
    if (imageForm.provider !== 'disabled' && !imageForm.model) return;
    setImageSaving(true);
    try {
      saveImageDraft(imageForm);
      const payload: ImageProviderConfig = {
        provider: imageForm.provider ?? 'disabled',
        baseUrl: imageForm.baseUrl ?? '',
        apiKey: imageForm.apiKey ?? '',
        model: imageForm.model ?? '',
        size: imageForm.size ?? '',
        quality: imageForm.quality ?? '',
        format: imageForm.format ?? '',
        enabled: imageForm.enabled ?? false,
      };
      await apiPost<ImageProviderConfig>('/settings/image-provider', payload);
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 3000);
    } catch (err) {
      console.error('Image save failed', err);
    } finally {
      setImageSaving(false);
    }
  };

  const isTextFormValid = Boolean(form.chatModel);

  const handleImageTest = async () => {
    if ((imageForm.provider ?? 'disabled') === 'disabled' || !imageForm.enabled) {
      setImageTestResult({ ok: true, provider: 'disabled', warning: 'Image generation is disabled. Fallback assets will be used.' });
      return;
    }

    if (!imageForm.model && imageForm.provider !== 'disabled') {
      setImageTestResult({ ok: false, provider: imageForm.provider ?? 'unknown', error: 'Missing image model. Enter a model name (e.g., gpt-image-2).' });
      return;
    }

    setImageTesting(true);
    setImageTestResult(null);
    try {
      const payload: ImageProviderConfig = {
        provider: imageForm.provider ?? 'disabled',
        baseUrl: imageForm.baseUrl ?? '',
        apiKey: imageForm.apiKey ?? '',
        model: imageForm.model ?? '',
        size: imageForm.size ?? '',
        quality: imageForm.quality ?? '',
        format: imageForm.format ?? '',
        enabled: imageForm.enabled ?? false,
      };
      const res = await apiPost<ImageProviderStatus>('/settings/image-provider/test', payload);
      setImageTestResult(res);
    } catch (err) {
      setImageTestResult({
        ok: false,
        provider: imageForm.provider ?? 'unknown',
        error: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setImageTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-label mb-1">SYSTEM</p>
        <h1 className="font-serif text-display text-parchment">Provider Settings</h1>
      </div>

      {/* Text Provider Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="font-serif text-xl text-parchment">Text Provider</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {TEXT_PRESETS.map((preset) => {
            const isActive = activePreset?.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'rounded-card border px-4 py-2 text-small transition-all duration-archive',
                  isActive
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-ridge bg-surface text-ash hover:text-parchment hover:bg-surface/60'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {serverLoading && (
          <div className="flex items-center gap-2 text-dust">
            <Spinner className="h-4 w-4" />
            <span className="text-small">Loading server defaults…</span>
          </div>
        )}

        <Card>
          <CardContent className="space-y-5 p-5">
            <FieldRow icon={Server} label="Base URL">
              <Input
                value={form.baseUrl ?? ''}
                onChange={(e) => updateField('baseUrl', e.target.value)}
                placeholder={form.provider === 'custom-openai' ? 'Leave empty for official OpenAI endpoint' : 'http://localhost:11434'}
                className="bg-depth"
              />
              {form.provider === 'custom-openai' && (
                <p className="text-tiny text-dust">Leave empty to use the official OpenAI endpoint (api.openai.com).</p>
              )}
              {form.provider === 'ollama' && (
                <p className="text-tiny text-dust">Ollama server address. Default: http://localhost:11434</p>
              )}
              {form.provider === 'openrouter' && (
                <p className="text-tiny text-dust">OpenRouter endpoint. Default: https://openrouter.ai/api/v1</p>
              )}
            </FieldRow>

            <FieldRow icon={Key} label="API Key">
              <Input
                type="text"
                value={form.apiKey ?? ''}
                onChange={(e) => updateField('apiKey', e.target.value)}
                placeholder="Optional for local providers"
                className="bg-depth"
              />
              <p className="text-tiny text-dust">Leave empty for local or unauthenticated endpoints.</p>
            </FieldRow>

            <FieldRow icon={MessageSquare} label="Chat Model">
              <Input
                value={form.chatModel ?? ''}
                onChange={(e) => updateField('chatModel', e.target.value)}
                placeholder="gpt-4o-mini, llama3.1, qwen/qwen3-coder …"
                className="bg-depth"
              />
              <p className="text-tiny text-dust">Free-form model name. No hardcoded list.</p>
            </FieldRow>

            <div className="grid grid-cols-2 gap-4">
              <FieldRow icon={Gauge} label="Temperature">
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  max={2}
                  value={form.temperature ?? 0.8}
                  onChange={(e) => updateField('temperature', Number(e.target.value))}
                  className="bg-depth"
                />
              </FieldRow>
              <div className="space-y-2">
                <label className="text-small font-medium text-parchment">Max Tokens</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxTokens ?? 800}
                  onChange={(e) => updateField('maxTokens', Number(e.target.value))}
                  className="bg-depth"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !isTextFormValid} variant="primary">
                {saving ? <Spinner className="mr-2 h-4 w-4" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                {saved ? 'Saved' : 'Save Settings'}
              </Button>
              <Button onClick={handleTest} disabled={testing || !isTextFormValid} variant="outline">
                {testing ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <WifiOff className="mr-2 h-4 w-4" />}
                Test Connection
              </Button>
            </div>

            {testResult && (
              <div
                className={cn(
                  'rounded-card border px-4 py-3 text-small',
                  testResult.ok
                    ? 'border-gold/30 bg-gold/5 text-gold'
                    : 'border-fear/30 bg-fear/5 text-fear'
                )}
              >
                <div className="flex items-center gap-2">
                  {testResult.ok ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <span className="font-medium">{testResult.ok ? 'Connected' : 'Connection failed'}</span>
                </div>
                <div className="mt-1 space-y-0.5 text-tiny text-dust">
                  <p>Provider: {testResult.provider}</p>
                  {testResult.model && <p>Model: {testResult.model}</p>}
                  <p>Streaming: {testResult.streaming ? 'yes' : 'no'}</p>
                  {testResult.error && <p className="text-fear">{testResult.error}</p>}
                </div>
              </div>
            )}

            <div className="rounded-card border border-ridge bg-depth/50 p-4 space-y-2 text-tiny text-dust">
              <p className="text-small font-medium text-ash">Current Configuration</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <span className="shrink-0">Provider:</span>
                <span className="text-ash break-all">{form.provider ?? '—'}</span>
                <span className="shrink-0">Base URL:</span>
                <span className="text-ash break-all">{form.baseUrl || 'official'}</span>
                <span className="shrink-0">Chat Model:</span>
                <span className="text-ash break-all">{form.chatModel || '—'}</span>
                <span className="shrink-0">API Key:</span>
                <span className="text-ash break-all">{form.apiKey || 'none'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedding Provider Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="font-serif text-xl text-parchment">Embedding Provider</h2>
        </div>
        <p className="text-small text-dust">Uses the same endpoint and API key as your Text Provider by default. Change only if you run embeddings on a separate server.</p>

        <div className="flex flex-wrap gap-3">
          {EMBEDDING_PRESETS.map((preset) => {
            const isActive = form.embeddingModel === preset.embeddingModel;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, embeddingModel: preset.embeddingModel }));
                  setSaved(false);
                }}
                className={cn(
                  'rounded-card border px-4 py-2 text-small transition-all duration-archive',
                  isActive
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-ridge bg-surface text-ash hover:text-parchment hover:bg-surface/60'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <Card>
          <CardContent className="space-y-5 p-5">
            <FieldRow icon={Layers} label="Embedding Model">
              <Input
                value={form.embeddingModel ?? ''}
                onChange={(e) => updateField('embeddingModel', e.target.value)}
                placeholder="text-embedding-3-small (leave empty to use Text Provider)"
                className="bg-depth"
              />
              <p className="text-tiny text-dust">Leave empty to use the same endpoint as your Text Provider.</p>
            </FieldRow>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !isTextFormValid} variant="primary">
                {saving ? <Spinner className="mr-2 h-4 w-4" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                {saved ? 'Saved' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Provider Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <h2 className="font-serif text-xl text-parchment">Image Generation</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {IMAGE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyImagePreset(preset)}
              className={cn(
                'rounded-card border px-4 py-2 text-small transition-all duration-archive',
                imageForm.provider === preset.value
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-ridge bg-surface text-ash hover:text-parchment hover:bg-surface/60'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {imageServerLoading && (
          <div className="flex items-center gap-2 text-dust">
            <Spinner className="h-4 w-4" />
            <span className="text-small">Loading image provider defaults…</span>
          </div>
        )}

        <Card>
          <CardContent className="space-y-5 p-5">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-small font-medium text-parchment">
                <Image className="h-4 w-4 text-gold" strokeWidth={1.5} />
                Enable Image Generation
              </label>
              <button
                type="button"
                aria-label={imageForm.enabled ? 'Disable image generation' : 'Enable image generation'}
                title={imageForm.enabled ? 'Disable image generation' : 'Enable image generation'}
                onClick={() => updateImageField('enabled', !imageForm.enabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  imageForm.enabled ? 'bg-gold' : 'bg-ridge'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-parchment transition-transform',
                    imageForm.enabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            <p className="text-tiny text-dust">
              {imageForm.enabled
                ? 'Image generation is enabled. Banners and portraits will be generated during world/character creation.'
                : 'Image generation is disabled. Deterministic SVG fallbacks will be used for all visual assets.'}
            </p>


            <FieldRow icon={Server} label="Image Base URL">
              <Input
                value={imageForm.baseUrl ?? ''}
                onChange={(e) => updateImageField('baseUrl', e.target.value)}
                placeholder="Leave empty for official OpenAI endpoint"
                disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                className="bg-depth"
              />
              {imageForm.provider === 'openai-image' && (
                <p className="text-tiny text-dust">Leave empty to use the official OpenAI endpoint. Only set this if you use a proxy or custom base URL.</p>
              )}
              {imageForm.provider === 'custom-image-endpoint' && (
                <p className="text-tiny text-dust">Required: the full base URL of your custom image endpoint.</p>
              )}
            </FieldRow>

            <FieldRow icon={Key} label="Image API Key">
              <Input
                type="text"
                value={imageForm.apiKey ?? ''}
                onChange={(e) => updateImageField('apiKey', e.target.value)}
                placeholder="sk-... (falls back to OPENAI_API_KEY if empty)"
                disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                className="bg-depth"
              />
            </FieldRow>

            <FieldRow icon={Paintbrush} label="Image Model">
              <Input
                value={imageForm.model ?? ''}
                onChange={(e) => updateImageField('model', e.target.value)}
                placeholder="gpt-image-2"
                disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                className="bg-depth"
              />
              <p className="text-tiny text-dust">Required when enabled. Examples: gpt-image-2, gpt-image-1.5, gpt-image-1-mini.</p>
            </FieldRow>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-small font-medium text-parchment">Size</label>
                <Input
                  value={imageForm.size ?? ''}
                  onChange={(e) => updateImageField('size', e.target.value)}
                  placeholder="1536x1024"
                  disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                  className="bg-depth"
                />
              </div>
              <div className="space-y-2">
                <label className="text-small font-medium text-parchment">Quality</label>
                <Input
                  value={imageForm.quality ?? ''}
                  onChange={(e) => updateImageField('quality', e.target.value)}
                  placeholder="low"
                  disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                  className="bg-depth"
                />
              </div>
              <div className="space-y-2">
                <label className="text-small font-medium text-parchment">Format</label>
                <Input
                  value={imageForm.format ?? ''}
                  onChange={(e) => updateImageField('format', e.target.value)}
                  placeholder="webp"
                  disabled={!imageForm.enabled || imageForm.provider === 'disabled'}
                  className="bg-depth"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleImageSave} disabled={imageSaving || ((imageForm.provider === 'openai-image' || imageForm.provider === 'custom-image-endpoint') && !imageForm.model)} variant="primary">
                {imageSaving ? <Spinner className="mr-2 h-4 w-4" /> : imageSaved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                {imageSaved ? 'Saved' : 'Save Image Settings'}
              </Button>
              <Button
                onClick={handleImageTest}
                disabled={imageTesting}
                variant="outline"
              >
                {imageTesting ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <WifiOff className="mr-2 h-4 w-4" />}
                Test Image Provider
              </Button>
            </div>

            {imageTestResult && (
              <div
                className={cn(
                  'rounded-card border px-4 py-3 text-small',
                  imageTestResult.ok
                    ? 'border-gold/30 bg-gold/5 text-gold'
                    : 'border-fear/30 bg-fear/5 text-fear'
                )}
              >
                <div className="flex items-center gap-2">
                  {imageTestResult.ok ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <span className="font-medium">
                    {imageTestResult.ok ? 'Image provider ready' : 'Image provider unavailable'}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-tiny text-dust">
                  <p>Provider: {imageTestResult.provider}</p>
                  {imageTestResult.model && <p>Model: {imageTestResult.model}</p>}
                  {imageTestResult.warning && <p className="text-amber">{imageTestResult.warning}</p>}
                  {imageTestResult.error && <p className="text-fear">{imageTestResult.error}</p>}
                </div>
              </div>
            )}

            <div className="rounded-card border border-ridge bg-depth/50 p-4 space-y-2 text-tiny text-dust">
              <p className="text-small font-medium text-ash">Image Configuration</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <span className="shrink-0">Enabled:</span>
                <span className="text-ash break-all">{imageForm.enabled ? 'yes' : 'no'}</span>
                <span className="shrink-0">Provider:</span>
                <span className="text-ash break-all">{imageForm.provider ?? '—'}</span>
                <span className="shrink-0">Model:</span>
                <span className="text-ash break-all">{imageForm.model || 'default'}</span>
                <span className="shrink-0">API Key:</span>
                <span className="text-ash break-all">{imageForm.apiKey || 'none'}</span>
                <span className="shrink-0">Base URL:</span>
                <span className="text-ash break-all">{imageForm.baseUrl || 'official'}</span>
                <span className="shrink-0">Size / Quality / Format:</span>
                <span className="text-ash break-all">{imageForm.size || '—'} / {imageForm.quality || '—'} / {imageForm.format || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FieldRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-small font-medium text-parchment">
        <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
        {label}
      </label>
      {children}
    </div>
  );
}
