import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { apiPost, useApi, API_BASE } from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import { Server, Key, MessageSquare, Layers, Image, Gauge, CheckCircle2, AlertCircle, WifiOff, Plug, RotateCw } from 'lucide-react';
import type { ProviderConfig, ProviderStatus } from '@loreweaver/shared';

const STORAGE_KEY = 'loreweaver-provider-config';

const PRESETS: { label: string; value: ProviderConfig['provider']; defaults: Partial<ProviderConfig> }[] = [
  {
    label: 'Custom OpenAI-Compatible',
    value: 'custom-openai',
    defaults: {
      baseUrl: 'http://localhost:1234/v1',
      chatModel: '',
      embeddingModel: '',
      imageModel: '',
    },
  },
  {
    label: 'Ollama Local',
    value: 'ollama',
    defaults: {
      baseUrl: 'http://localhost:11434',
      chatModel: '',
      embeddingModel: '',
      imageModel: '',
    },
  },
  {
    label: 'Ollama Remote / Cloud',
    value: 'ollama',
    defaults: {
      baseUrl: '',
      chatModel: '',
      embeddingModel: '',
      imageModel: '',
    },
  },
  {
    label: 'OpenRouter',
    value: 'openrouter',
    defaults: {
      baseUrl: 'https://openrouter.ai/api/v1',
      chatModel: '',
      embeddingModel: '',
      imageModel: '',
    },
  },
];

function loadSavedConfig(): Partial<ProviderConfig> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ProviderConfig>;
  } catch {
    return null;
  }
}

function saveConfig(config: Partial<ProviderConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function Settings() {
  const { data: serverConfig, loading: serverLoading } = useApi<ProviderConfig>('/settings/provider');
  const [form, setForm] = useState<Partial<ProviderConfig>>(loadSavedConfig() ?? {
    provider: 'custom-openai',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: '',
    chatModel: '',
    embeddingModel: '',
    imageModel: '',
    temperature: 0.8,
    maxTokens: 800,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ProviderStatus | null>(null);

  // Merge server defaults once loaded
  useEffect(() => {
    if (serverConfig) {
      setForm((prev) => ({
        ...serverConfig,
        ...prev,
      }));
    }
  }, [serverConfig]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setForm((prev: Partial<ProviderConfig>) => ({
      ...prev,
      provider: preset.value,
      baseUrl: preset.defaults.baseUrl ?? prev.baseUrl,
      chatModel: preset.defaults.chatModel ?? prev.chatModel,
      embeddingModel: preset.defaults.embeddingModel ?? prev.embeddingModel,
      imageModel: preset.defaults.imageModel ?? prev.imageModel,
    }));
    setSaved(false);
    setTestResult(null);
  };

  const updateField = <K extends keyof ProviderConfig>(key: K, value: ProviderConfig[K]) => {
    setForm((prev: Partial<ProviderConfig>) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form.baseUrl || !form.chatModel) return;
    setSaving(true);
    try {
      saveConfig(form);
      const payload: ProviderConfig = {
        provider: form.provider ?? 'custom-openai',
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
        chatModel: form.chatModel,
        embeddingModel: form.embeddingModel,
        imageModel: form.imageModel,
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
    if (!form.baseUrl || !form.chatModel) return;
    setTesting(true);
    setTestResult(null);
    try {
      const payload: ProviderConfig = {
        provider: form.provider ?? 'custom-openai',
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
        chatModel: form.chatModel,
        embeddingModel: form.embeddingModel,
        imageModel: form.imageModel,
        temperature: form.temperature ?? 0.8,
        maxTokens: form.maxTokens ?? 800,
      };
      const res = await apiPost<{ data: ProviderStatus }>('/settings/provider/test', payload);
      setTestResult(res.data);
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-label mb-1">SYSTEM</p>
        <h1 className="font-serif text-display text-parchment">Provider Settings</h1>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className={cn(
              'rounded-card border px-4 py-2 text-small transition-all duration-archive',
              form.provider === preset.value && preset.label.toLowerCase().includes((form.baseUrl ?? '').toLowerCase().includes('ollama') ? 'ollama' : form.baseUrl ?? '')
                ? 'border-gold bg-gold/10 text-gold'
                : form.provider === preset.value
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-ridge bg-surface text-ash hover:text-parchment hover:bg-surface/60'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {serverLoading && (
        <div className="flex items-center gap-2 text-dust">
          <Spinner className="h-4 w-4" />
          <span className="text-small">Loading server defaults…</span>
        </div>
      )}

      <Card>
        <CardContent className="space-y-5 p-5">
          {/* Provider Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <Plug className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Provider
            </label>
            <select
              aria-label="Provider type"
              value={form.provider ?? 'custom-openai'}
              onChange={(e) => updateField('provider', e.target.value as ProviderConfig['provider'])}
              className="h-10 w-full appearance-none rounded-card border border-ridge bg-surface px-4 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
            >
              <option value="custom-openai">Custom OpenAI-Compatible</option>
              <option value="ollama">Ollama</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <Server className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Base URL
            </label>
            <Input
              value={form.baseUrl ?? ''}
              onChange={(e) => updateField('baseUrl', e.target.value)}
              placeholder="http://localhost:1234/v1"
              className="bg-depth"
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <Key className="h-4 w-4 text-gold" strokeWidth={1.5} />
              API Key
            </label>
            <Input
              type="password"
              value={form.apiKey ?? ''}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder="Optional for local providers"
              className="bg-depth"
            />
            <p className="text-tiny text-dust">Leave empty for local or unauthenticated endpoints.</p>
          </div>

          {/* Chat Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <MessageSquare className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Chat Model
            </label>
            <Input
              value={form.chatModel ?? ''}
              onChange={(e) => updateField('chatModel', e.target.value)}
              placeholder="gpt-4o-mini, llama3.1, qwen/qwen3-coder …"
              className="bg-depth"
            />
            <p className="text-tiny text-dust">Free-form model name. No hardcoded list.</p>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <Layers className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Embedding Model
            </label>
            <Input
              value={form.embeddingModel ?? ''}
              onChange={(e) => updateField('embeddingModel', e.target.value)}
              placeholder="text-embedding-3-small (optional)"
              className="bg-depth"
            />
          </div>

          {/* Image Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-small font-medium text-parchment">
              <Image className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Image Model
            </label>
            <Input
              value={form.imageModel ?? ''}
              onChange={(e) => updateField('imageModel', e.target.value)}
              placeholder="Optional"
              className="bg-depth"
            />
          </div>

          {/* Temperature & Max Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-small font-medium text-parchment">
                <Gauge className="h-4 w-4 text-gold" strokeWidth={1.5} />
                Temperature
              </label>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={2}
                value={form.temperature ?? 0.8}
                onChange={(e) => updateField('temperature', Number(e.target.value))}
                className="bg-depth"
              />
            </div>
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

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !form.baseUrl || !form.chatModel} variant="primary">
              {saving ? <Spinner className="mr-2 h-4 w-4" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
              {saved ? 'Saved' : 'Save Settings'}
            </Button>
            <Button onClick={handleTest} disabled={testing || !form.baseUrl || !form.chatModel} variant="outline">
              {testing ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <WifiOff className="mr-2 h-4 w-4" />}
              Test Connection
            </Button>
          </div>

          {/* Test Result */}
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

          {/* Status Summary */}
          <div className="rounded-card border border-ridge bg-depth/50 p-4 space-y-2 text-tiny text-dust">
            <p className="text-small font-medium text-ash">Current Configuration</p>
            <div className="grid grid-cols-2 gap-2">
              <span>Provider:</span>
              <span className="text-ash">{form.provider ?? '—'}</span>
              <span>Base URL:</span>
              <span className="text-ash">{form.baseUrl || '—'}</span>
              <span>Chat Model:</span>
              <span className="text-ash">{form.chatModel || '—'}</span>
              <span>API Key:</span>
              <span className="text-ash">{form.apiKey ? '••••••••' : 'none'}</span>
              <span>Embeddings:</span>
              <span className="text-ash">{form.embeddingModel || 'default'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
