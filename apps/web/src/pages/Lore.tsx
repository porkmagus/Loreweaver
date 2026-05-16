import { useState } from 'react';
import { useApi, apiPost, apiPatch, apiDelete } from '@/hooks/useApi';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { BookOpen, Plus, ChevronLeft, Tag, Search, Upload, Pencil, Trash2 } from 'lucide-react';
import type { LoreEntry, World } from '@loreweaver/shared';
import { Link, useSearchParams } from 'react-router-dom';

export function Lore() {
  const [params] = useSearchParams();
  const viewId = params.get('id');

  if (viewId) {
    return <LoreDetail loreId={Number(viewId)} />;
  }

  return <LoreList />;
}

function LoreList() {
  const [searchParams] = useSearchParams();
  const worldId = searchParams.get('worldId');
  const url = worldId ? `/lore/world/${worldId}` : '/lore';
  const { data: entries, loading, error, refetch } = useApi<LoreEntry[]>(url);
  const { data: worlds } = useApi<World[]>('/worlds');
  const [selectedWorld, setSelectedWorld] = useState<string>(worldId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost<LoreEntry>('/lore', {
        worldId: Number(fd.get('worldId')),
        title: fd.get('title'),
        content: fd.get('content'),
        category: fd.get('category') || undefined,
        tags: fd.get('tags') || undefined,
      });
      setFormOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create lore entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lore</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {worldId ? 'Lore for this world' : 'All lore entries'}
          </p>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} disabled={!worldId}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {!worldId && (
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by World
            </label>
            <select
              value={selectedWorld}
              onChange={(e) => setSelectedWorld(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="">All worlds</option>
              {worlds?.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
            {selectedWorld && (
              <Link to={`/lore?worldId=${selectedWorld}`} className="mt-3 inline-block">
                <Button variant="primary" size="sm">Apply Filter</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {formOpen && worldId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Lore Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="hidden" name="worldId" value={worldId} />
              <Input name="title" placeholder="Entry title" required />
              <Textarea name="content" placeholder="Content" rows={4} required />
              <Input name="category" placeholder="Category (e.g., history, magic)" />
              <Input name="tags" placeholder="Tags (comma-separated)" />
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">
                  {submitting ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="space-y-3">
        {entries?.map((entry) => (
          <div
            key={entry.id}
            className="group relative rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
          >
            <div className="flex items-start gap-3">
              <Link to={`/lore?id=${entry.id}`} className="flex items-start gap-3 flex-1 min-w-0">
                <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {entry.category && (
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {entry.category}
                      </span>
                    )}
                    {entry.tags && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Tag className="h-3 w-3" />
                        {entry.tags}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                onClick={async () => {
                  if (!confirm('Delete this lore entry?')) return;
                  try { await apiDelete(`/lore/${entry.id}`); refetch(); } catch {}
                }}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {entries?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <BookOpen className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm mb-3">No lore entries yet.</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lore Entry
          </Button>
        </div>
      )}
    </div>
  );
}

function LoreDetail({ loreId }: { loreId: number }) {
  const { data: entry, loading, error, refetch } = useApi<LoreEntry>(`/lore/${loreId}`);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    chunkIndex: number;
    chunkText: string;
    score: number;
    loreEntryId: number;
    title: string;
    entryExists: boolean;
  }> | null>(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleIngest = async () => {
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await apiPost<{ entryId: number; chunks: number }>(`/lore/${loreId}/ingest`, {});
      setIngestResult(`Ingested ${res.chunks} chunk(s)`);
    } catch (err) {
      setIngestResult(err instanceof Error ? err.message : 'Ingest failed');
    } finally {
      setIngesting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !entry?.worldId) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await apiPost<{
        chunkIndex: number;
        chunkText: string;
        score: number;
        loreEntryId: number;
        title: string;
        entryExists: boolean;
      }[]>('/search/lore', { worldId: entry.worldId, query: searchQuery.trim(), limit: 10 });
      setSearchResults(res);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPatch<LoreEntry>(`/lore/${loreId}`, {
        title: fd.get('title') || undefined,
        content: fd.get('content') || undefined,
        category: fd.get('category') || undefined,
        tags: fd.get('tags') || undefined,
      });
      setEditing(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/lore">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{entry?.title ?? 'Lore Entry'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {entry?.category ?? 'No category'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} disabled={!entry}>
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleIngest} disabled={ingesting || !entry}>
          <Upload className="mr-2 h-4 w-4" />
          {ingesting ? 'Ingesting…' : 'Ingest'}
        </Button>
      </div>

      {ingestResult && (
        <div className={`rounded-md px-4 py-3 text-sm ${ingestResult.startsWith('Ingested') ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'}`}>
          {ingestResult}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      )}

      {editing && entry && (
        <Card>
          <CardHeader><CardTitle>Edit Lore Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Input name="title" defaultValue={entry.title} placeholder="Title" required />
              <Textarea name="content" defaultValue={entry.content} placeholder="Content" rows={5} required />
              <Input name="category" defaultValue={entry.category ?? ''} placeholder="Category" />
              <Input name="tags" defaultValue={entry.tags ?? ''} placeholder="Tags (comma-separated)" />
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">{submitting ? 'Saving…' : 'Save'}</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {entry && !editing && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {entry.content}
            </p>
            {entry.tags && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Tag className="h-3 w-3" />
                {entry.tags}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {entry && (
        <Card>
          <CardHeader>
            <CardTitle>Semantic Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lore by meaning..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="primary" onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                <Search className="mr-2 h-4 w-4" />
                {searching ? 'Searching…' : 'Search'}
              </Button>
            </div>

            {searchResults && searchResults.length === 0 && (
              <p className="text-sm text-slate-500">No results found.</p>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((r, i) => (
                  <div key={i} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {r.title} — chunk {r.chunkIndex}
                      </span>
                      <span className="text-xs text-slate-500">score {r.score.toFixed(3)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      {r.chunkText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
