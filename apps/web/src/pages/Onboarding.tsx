import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Globe, Sparkles, AlertCircle } from 'lucide-react';

export function Onboarding() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      await apiPost<{ worldId: number; name: string }>('/worlds/generate', { prompt: prompt.trim() });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate world');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-10 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-card border border-gold/30 bg-gold/5">
            <Globe className="h-8 w-8 text-gold" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-display text-parchment">
              Loreweaver
            </h1>
            <p className="text-body text-ash max-w-md mx-auto">
              Describe a world and the archive will build it — characters, lore, timeline, and living memory.
            </p>
          </div>
        </div>

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
            <div className="absolute bottom-3 right-4 text-tiny text-ghost">
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
                Weaving world…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Generate World
              </span>
            )}
          </Button>
        </form>

        <p className="text-small text-dust">
          No API key? The archive will craft a curated demo world. Add OPENAI_API_KEY for AI-generated creations.
        </p>
      </div>
    </div>
  );
}
