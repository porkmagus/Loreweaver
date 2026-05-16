import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Globe, Sparkles, AlertCircle, X } from 'lucide-react';

export function GenerateWorldModal({ onClose }: { onClose?: () => void }) {
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
      const res = await apiPost<{ worldId: number; name: string }>('/worlds/generate', {
        prompt: prompt.trim(),
      });
      onClose?.();
      navigate(`/worlds?id=${res.worldId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate world');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-card border border-ridge bg-surface bg-surface-grad p-6 shadow-depth">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-h2 text-parchment flex items-center gap-2">
            <Globe className="h-5 w-5 text-gold" strokeWidth={1.5} />
            Forge Realm
          </h2>
          <button
            onClick={onClose}
            className="rounded-card p-1.5 text-dust hover:text-parchment hover:bg-surface transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A world of towering spires and ancient pacts, where memory itself is currency…"
              rows={4}
              maxLength={2000}
              disabled={generating}
              className="w-full resize-none rounded-card border border-ridge bg-depth px-4 py-3 text-body text-parchment placeholder:text-dust focus:border-gold focus:shadow-gold-glow focus:outline-none disabled:opacity-50 transition-all duration-archive"
            />
            <div className="absolute bottom-3 right-4 text-tiny text-ghost">
              {prompt.length}/2000
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
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
                Weaving realm and imagery…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                Generate World
              </span>
            )}
          </Button>
          {generating && (
            <div className="grid grid-cols-3 gap-2 text-center text-tiny uppercase tracking-widest text-dust">
              <span className="rounded-card border border-ridge bg-depth px-2 py-2">World</span>
              <span className="rounded-card border border-ridge bg-depth px-2 py-2">Banner</span>
              <span className="rounded-card border border-ridge bg-depth px-2 py-2">Portraits</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
