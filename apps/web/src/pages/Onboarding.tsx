import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, API_BASE } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Globe, Sparkles, AlertCircle, Settings, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PHASES = [
  { label: 'World', delay: 0 },
  { label: 'Banner', delay: 3500 },
  { label: 'Portraits', delay: 7000 },
] as const;

interface HealthData {
  status: string;
  aiMode: 'live' | 'simulated';
  provider?: string;
  chatModel?: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((json) => setHealth(json))
      .catch(() => setHealth({ status: 'ok', aiMode: 'simulated' }));
  }, []);

  useEffect(() => {
    if (!generating) {
      setPhase(0);
      return;
    }
    const timers = PHASES.slice(1).map((p) =>
      setTimeout(() => setPhase((i) => Math.max(i, PHASES.indexOf(p) + 1)), p.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [generating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setPhase(0);
    try {
      await apiPost<{ worldId: number; name: string }>('/worlds/generate', { prompt: prompt.trim() }, { timeout: 180_000 });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate world');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-4 py-12">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,169,110,0.18),transparent_32%),linear-gradient(145deg,#0A0B0F,#111318_48%,#201713)]" />
      <div className="fixed inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,#0A0B0F_78%)]" />
      <div className="fixed left-[10%] top-[18%] h-72 w-72 rounded-full bg-memory/10 blur-3xl" />
      <div className="fixed right-[12%] top-[28%] h-80 w-80 rounded-full bg-ember/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl space-y-10 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-card border border-gold/30 bg-gold/5">
            <Globe className="h-8 w-8 text-gold" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-display text-gold drop-shadow-[0_0_24px_rgba(201,169,110,0.35)]">
              Loreweaver
            </h1>
            <p className="text-body text-ash max-w-md mx-auto">
              Describe a world and the archive will build it — characters, lore, timeline, living memory, and a visual identity.
            </p>
          </div>
        </div>

        {health && health.aiMode === 'simulated' && (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-card border border-gold/20 bg-gold/5 px-5 py-4">
            <div className="flex items-center gap-2 text-small text-gold">
              <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
              Running in simulated mode — no live AI provider configured.
            </div>
            <Button
              variant="ghost"
              className="text-tiny text-gold hover:text-parchment"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-3 w-3" strokeWidth={1.5} />
              Open settings to configure a provider
            </Button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A medieval kingdom where spies trade secrets in candlelit taverns and an ancient forest whispers forgotten magic…"
              rows={4}
              maxLength={2000}
              disabled={generating}
              className="w-full resize-none rounded-card border border-ridge bg-surface px-5 py-4 text-body text-parchment placeholder:text-dust focus:border-gold focus:shadow-gold-glow focus:outline-none disabled:opacity-50 transition-all duration-archive"
            />
            <div className="absolute bottom-3 right-4 text-tiny text-dust">
              {prompt.length}/2000
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
              <AlertCircle className="h-4 w-4" strokeWidth={1.5} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={generating || !prompt.trim()}
            variant="primary"
            className="w-full"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Weaving world and imagery…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Generate World
              </span>
            )}
          </Button>

          {generating && (
            <div className="grid grid-cols-3 gap-2 text-center text-tiny uppercase tracking-widest">
              {PHASES.map((p, i) => {
                const active = i === phase;
                const done = i < phase;
                return (
                  <span
                    key={p.label}
                    className={cn(
                      'rounded-card border px-2 py-2 transition-all duration-archive flex items-center justify-center gap-1.5',
                      active
                        ? 'border-gold/40 text-gold bg-gold/10 shadow-gold-glow animate-pulse'
                        : done
                          ? 'border-sage/30 text-sage bg-sage/5'
                          : 'border-ridge text-dust bg-depth'
                    )}
                  >
                    {done && <Check className="h-3 w-3" strokeWidth={2} />}
                    {p.label}
                  </span>
                );
              })}
            </div>
          )}
        </form>

        <p className="text-small text-ash">
          No image provider? The archive keeps cinematic fallback visuals so generation never breaks the flow.
        </p>
      </div>
    </div>
  );
}
