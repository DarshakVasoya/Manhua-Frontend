
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaGrid from "../../components/MangaGrid";

const API = "http://165.232.60.4:8000/manhwa/search";

const genresOf = (it: any): string[] =>
  Array.isArray(it?.genres)
    ? it.genres
    : typeof it?.genre === "string"
    ? it.genre.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("query") || "").trim();
  const page = Number(searchParams.get("page") || 1);
  const limit = 24;

  const [list, setList] = useState<any[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}?query=${encodeURIComponent(q)}&page=${page}&limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => {
  const items: any[] = Array.isArray(json) ? json : Array.isArray(json?.results) ? json.results : [];
  setList(items);
  const genreSet = new Set<string>();
  items.forEach((it: any) => genresOf(it).forEach((g: string) => genreSet.add(g)));
  setGenres(Array.from(genreSet).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => setError("Failed to fetch search results."))
      .finally(() => setLoading(false));
  }, [q, page]);

  const hasPrev = page > 1;
  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-6">
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
              setLoading(true);
              setList([]);
              setGenres([]);
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

      {q && list.length === 0 && !error && !loading && (
        <div className="text-sm text-[var(--color-text-dim)]">No results found.</div>
      )}

      {loading ? (
        <div className="text-sm text-[var(--color-text-dim)]">Loading…</div>
      ) : list.length > 0 && <MangaGrid items={list} />}

      {list.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-6">
          <a
            href={`/search?query=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${hasPrev ? 'cursor-pointer' : 'opacity-40 cursor-default pointer-events-none'}`}
            aria-disabled={!hasPrev}
          >
            Prev
          </a>
          <span className="text-xs text-[var(--color-text-dim)]">Page {page}</span>
          <a
            href={`/search?query=${encodeURIComponent(q)}&page=${page + 1}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${hasNext ? 'cursor-pointer' : 'opacity-40 cursor-default pointer-events-none'}`}
            aria-disabled={!hasNext}
          >
            Next
          </a>
        </div>
      )}
    </main>
  );
}
// ...existing code...