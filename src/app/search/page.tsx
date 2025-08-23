
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MangaGrid from "../../components/MangaGrid";

const API ="https://api.manhwagalaxy.org/manhwa/search";

interface MangaItem {
  genres?: string[];
  genre?: string;
  [key: string]: unknown;
}

const genresOf = (it: MangaItem): string[] =>
  Array.isArray(it?.genres)
    ? it.genres
    : typeof it?.genre === "string"
    ? it.genre.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

export default function SearchPage() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const searchParams = useSearchParams();
  const q = (searchParams.get("query") || "").trim();
  const page = Number(searchParams.get("page") || 1);
  const limit = 24;

  const [list, setList] = useState<MangaItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    document.title = "Search | ManhwaGalaxy";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Search for your favorite manhwa series and chapters on ManhwaGalaxy.";
  }, []);

  useEffect(() => {
    if (!q) {
      setList([]);
      setGenres([]);
      setError(null);
      setLoading(false);
      setShowNoResults(false);
      return;
    }
    setLoading(true);
    setError(null);
    setShowNoResults(false);
    let timeoutId: NodeJS.Timeout;
    timeoutId = setTimeout(() => {
      setShowNoResults(true);
    }, 5000);
    fetch(`${API}?query=${encodeURIComponent(q)}&page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => {
        const items: MangaItem[] = Array.isArray(json) ? json : Array.isArray(json?.results) ? json.results : [];
        setList(items);
        const genreSet = new Set<string>();
        items.forEach((it) => genresOf(it).forEach((g: string) => genreSet.add(g)));
        setGenres(Array.from(genreSet).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => setError("Failed to fetch search results."))
      .finally(() => {
        setLoading(false);
        clearTimeout(timeoutId);
        setShowNoResults(false);
      });
    return () => clearTimeout(timeoutId);
  }, [q, page, API, limit, reload]);

  const hasPrev = page > 1;
  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-6">
      {!isOnline && (
        <div className="mb-4 p-4 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-700 flex items-center justify-center">
          <span className="font-semibold text-base mr-2">You are offline.</span>
          <span>Please check your internet connection.</span>
        </div>
      )}
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
        Search results for &ldquo;{q || "..."}&rdquo;
      </h1>

      {error ? (
        <div className="mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex flex-col items-center">
          <span className="font-semibold text-base mb-2">Oops! Something went wrong.</span>
          <span className="mb-3">{error}</span>
          <button
            onClick={() => {
              setError(null);
              setList([]);
              setGenres([]);
              setReload(r => r + 1);
            }}
            className="px-4 py-2 rounded bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition"
          >Retry</button>
        </div>
      ) : null}

      {!q && (
        <div className="text-sm text-[var(--color-text-dim)]">Type a search above and press Go.</div>
      )}

      {q && genres.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {genres.map((g) => (
            <span
              key={g}
              className="px-2 py-1 rounded-md border border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)]"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[var(--color-text-dim)]">Loading…</div>
      ) : (
        q && list.length === 0 && !error && showNoResults ? (
          <div className="text-sm text-[var(--color-text-dim)]">No results found.</div>
        ) : (
          list.length > 0 && <MangaGrid items={list.map(item => ({
            ...item,
            name: typeof item.name === 'string' ? item.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() : item.name
          }))} />
        )
      )}

      {list.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-6">
          <Link
            href={`/search?query=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${hasPrev ? 'cursor-pointer' : 'opacity-40 cursor-default pointer-events-none'}`}
            aria-disabled={!hasPrev}
            tabIndex={hasPrev ? 0 : -1}
          >
            Prev
          </Link>
          <span className="text-xs text-[var(--color-text-dim)]">Page {page}</span>
          <Link
            href={`/search?query=${encodeURIComponent(q)}&page=${page + 1}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${hasNext ? 'cursor-pointer' : 'opacity-40 cursor-default pointer-events-none'}`}
            aria-disabled={!hasNext}
            tabIndex={hasNext ? 0 : -1}
          >
            Next
          </Link>
        </div>
      )}
    </main>
  );
}
// ...existing code...