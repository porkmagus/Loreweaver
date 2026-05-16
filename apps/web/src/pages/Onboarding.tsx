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
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12 lg:min-h-screen">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/40">
          <Globe className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to Loreweaver
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Describe a world and we'll build it for you — characters, lore, timeline, and all.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A medieval kingdom where spies trade secrets in candlelit taverns and an ancient forest whispers forgotten magic..."
              rows={4}
              maxLength={2000}
              disabled={generating}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="absolute bottom-2 right-3 text-xs text-slate-400">
              {prompt.length}/2000
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
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
                Generating world…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generate World
              </span>
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          No API key? You'll get a curated demo world instead. Add OPENAI_API_KEY for AI-generated creations.
        </p>
      </div>
    </div>
  );
}
