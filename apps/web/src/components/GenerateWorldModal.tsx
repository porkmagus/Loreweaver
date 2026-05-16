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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Generate World
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a world and we'll build it for you — characters, lore, timeline, and all..."
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
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
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
      </div>
    </div>
  );
}
