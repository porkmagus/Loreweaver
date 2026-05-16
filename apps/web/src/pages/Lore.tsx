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
    <div className="space-y-section max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label mb-1">CODEX</p>
          <h1 className="font-serif text-display text-parchment">Lore</h1>
        </div>
        <Button onClick={() => setFormOpen(!formOpen)} disabled={!worldId} variant="primary">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
          New Entry
        </Button>
      </div>

      {!worldId && (
        <Card>
          <CardContent className="p-inner">
            <label className="block text-small font-medium text-ash mb-2">
              Filter by World
            </label>
            <div className="relative">
              <select
                value={selectedWorld}
                onChange={(e) => setSelectedWorld(e.target.value)}
                className="h-10 w-full appearance-none rounded-card border border-ridge bg-surface px-4 pr-10 text-small text-parchment focus:border-gold focus:shadow-gold-glow focus:outline-none"
              >
                <option value="" className="bg-depth">All worlds</option>
                {worlds?.map((w) => (
                  <option key={w.id} value={String(w.id)} className="bg-depth">{w.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-dust" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {selectedWorld && (
              <Link to={`/lore?worldId=${selectedWorld}`} className="mt-3 inline-block">
                <Button variant="primary" size="sm">Apply Filter</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
          {error}
        </div>
      )}

      {formOpen && worldId && (
        <Card>
          <CardHeader>
            <CardTitle>Inscribe New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="hidden" name="worldId" value={worldId} />
              <Input name="title" placeholder="Entry title" required />
              <Textarea name="content" placeholder="Content of the lore entry…" rows={4} required />
              <Input name="category" placeholder="Category (e.g., history, magic)" />
              <Input name="tags" placeholder="Tags (comma-separated)" />
              {formError && <p className="text-small text-fear">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} variant="primary">
                  {submitting ? 'Inscribing…' : 'Inscribe'}
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
            className="group relative rounded-card border border-ridge bg-surface bg-surface-grad p-5 transition-all duration-archive hover:border-gold/20"
          >
            <div className="flex items-start gap-4">
              <Link to={`/lore?id=${entry.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-gold/20 bg-gold/5">
                  <BookOpen className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-serif text-h3 text-parchment truncate group-hover:text-gold transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-small text-ash line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {entry.category && (
                      <span className="inline-block rounded-full border border-ridge bg-depth px-2.5 py-0.5 text-tiny text-dust uppercase tracking-wider">
                        {entry.category}
                      </span>
                    )}
                    {entry.tags && (
                      <span className="inline-flex items-center gap-1 text-tiny text-dust">
                        <Tag className="h-3 w-3" strokeWidth={1.5} />
                        {entry.tags}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Erase this lore entry?')) return;
                  try { await apiDelete(`/lore/${entry.id}`); refetch(); } catch {}
                }}
                className="shrink-0 rounded-card p-2 text-dust hover:bg-fear/10 hover:text-fear transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {entries?.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-dust">
          <BookOpen className="h-10 w-10 opacity-20" strokeWidth={1.5} />
          <div className="text-center space-y-1">
            <p className="text-body">The codex is empty.</p>
            <p className="text-small">Begin inscribing lore for this world.</p>
          </div>
          {worldId && (
            <Button onClick={() => setFormOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
              First Entry
            </Button>
          )}
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
      setIngestResult(`Indexed ${res.chunks} fragment${res.chunks === 1 ? '' : 's'}`);
    } catch (err) {
      setIngestResult(err instanceof Error ? err.message : 'Indexing failed');
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
    <div className="space-y-section max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/lore">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </Link>
        <div className="flex-1">
          <p className="text-label">CODEX ENTRY</p>
          <h1 className="font-serif text-display text-parchment">{entry?.title ?? 'Lore'}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} disabled={!entry}>
          <Pencil className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={handleIngest} disabled={ingesting || !entry}>
          <Upload className="mr-2 h-4 w-4" strokeWidth={1.5} />
          {ingesting ? 'Indexing…' : 'Index'}
        </Button>
      </div>

      {ingestResult && (
        <div className={`rounded-card px-4 py-3 text-small border ${ingestResult.startsWith('Indexed') ? 'border-sage/30 bg-sage/5 text-sage' : 'border-fear/30 bg-fear/5 text-fear'}`}>
          {ingestResult}
        </div>
      )}

      {error && (
        <div className="rounded-card border border-fear/30 bg-fear/5 px-4 py-3 text-small text-fear">
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
          <CardHeader><CardTitle>Edit Entry</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-3">
              <Input name="title" defaultValue={entry.title} placeholder="Title" required />
              <Textarea name="content" defaultValue={entry.content} placeholder="Content" rows={5} required />
              <Input name="category" defaultValue={entry.category ?? ''} placeholder="Category" />
              <Input name="tags" defaultValue={entry.tags ?? ''} placeholder="Tags (comma-separated)" />
              {formError && <p className="text-small text-fear">{formError}</p>}
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
          <CardContent className="p-inner space-y-4">
            <p className="text-body text-ash leading-relaxed">
              {entry.content}
            </p>
            {entry.tags && (
              <div className="flex items-center gap-1 text-small text-dust">
                <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
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
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by meaning…"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                <Search className="mr-2 h-4 w-4" strokeWidth={1.5} />
                {searching ? 'Searching…' : 'Search'}
              </Button>
            </div>

            {searchResults && searchResults.length === 0 && (
              <p className="text-small text-dust">No resonance found.</p>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((r, i) => (
                  <div key={i} className="rounded-card border border-ridge bg-depth p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-small font-medium text-ash">
                        {r.title} — fragment {r.chunkIndex}
                      </span>
                      <span className="text-tiny text-dust font-mono">score {r.score.toFixed(3)}</span>
                    </div>
                    <p className="text-small text-ash line-clamp-3 leading-relaxed">
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
