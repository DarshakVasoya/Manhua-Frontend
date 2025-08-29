'use client';
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaGrid from "../../components/MangaGrid";
import Link from "next/link";
import { AdvancedSearchBar } from "../../components/AdvancedSearchBar";

interface MangaItem {
  name?: string;
  rating?: number;
  score?: number;
  genres?: string[];
  genre?: string;
  // other properties are allowed but not used here
  [key: string]: unknown;
}

type SortOption = "latest" | "az" | "rating";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("query") || "").trim();
  const page = Number(searchParams.get("page") || 1);
  const initialSortParam = (searchParams.get("sort") || "latest").toLowerCase();
  const initialSort: SortOption = ["latest", "az", "rating"].includes(initialSortParam)
    ? (initialSortParam as SortOption)
    : "latest";
  const limit = 24;

  const [list, setList] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [filters, setFilters] = useState({
    query: q,
    genres: [] as string[],
  });
  const [sort, setSort] = useState<SortOption>(initialSort);

  useEffect(() => {

    setLoading(true);
    setError(null);
    setShowNoResults(false);

  // Build filter query for new API
  const genreParam = Array.isArray(filters.genres) ? filters.genres.join(",") : filters.genres;
  const url = `https://api.manhwagalaxy.org/manhwa/search?query=${encodeURIComponent(filters.query)}&genre=${encodeURIComponent(genreParam)}&page=${page}&limit=${limit}&sort=${encodeURIComponent(sort)}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    })
    .then((json: unknown) => {
      const payload = json as { results?: MangaItem[] } | MangaItem[] | null;
      let items: MangaItem[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload!.results as MangaItem[]
        : [];
      // Client-side fallback sorting
      if (sort === "az") {
        items = [...items].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      } else if (sort === "rating") {
        items = [...items].sort((a, b) => Number(b.rating ?? b.score ?? 0) - Number(a.rating ?? a.score ?? 0));
      }
      setList(items);
      setShowNoResults(items.length === 0);
    })
    .catch(() => {
      setError("Failed to fetch search results.");
      setShowNoResults(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [filters.query, page, filters.genres, sort]);

  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-1">
      <div className="mb-2 flex items-center gap-3">
        <AdvancedSearchBar
          initialQuery={q}
          autoFocus
          onSearch={({ query, genres }) => {
            setFilters({ query, genres });
            if (query && query !== q) {
              window.history.replaceState(null, "", `/search?query=${encodeURIComponent(query)}&page=1&sort=${encodeURIComponent(sort)}`);
            }
          }}
        />
      </div>
      {/* Small order bar under the search bar */}
      <div className="mb-3 text-xs flex items-center gap-2">
        <span className="opacity-70">Order by:</span>
        <div className="flex items-center gap-1">
          {([
            { key: "latest", label: "Latest" },
            { key: "az", label: "A–Z" },
            { key: "rating", label: "Rating" },
          ] as Array<{ key: SortOption; label: string }>).map(({ key, label }) => {
            const active = sort === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSort(key);
                  // reset to page 1 and keep current query in URL
                  const nextUrl = `/search?query=${encodeURIComponent(filters.query)}&page=1&sort=${encodeURIComponent(key)}`;
                  window.history.replaceState(null, "", nextUrl);
                }}
                className={`px-2.5 h-7 rounded-full border text-[11px] font-medium transition ${
                  active
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {(filters.query || filters.genres.length > 0) && (
        <div className="mb-2 text-sm md:text-base font-semibold text-[var(--color-accent)]">
          <span>Results{filters.query ? ' for' : ''}: </span>
          {filters.query && <span className="font-bold">{filters.query}</span>}
          {filters.genres.length > 0 && (
            <>
              <span className="opacity-70"> • </span>
              <span className="font-normal">{filters.genres.join(', ')}</span>
            </>
          )}
        </div>
      )}
    {loading && <div>Loading…</div>}
    {!loading && error && (
        <div className="text-sm text-red-400 mb-3">{error}</div>
      )}
    {filters.query && !loading && list.length === 0 && showNoResults && (
        <div className="flex flex-col items-center justify-center py-12">
          {/* Friendly SVG illustration */}
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="80" fill="#F3F4F6" />
            <ellipse cx="80" cy="120" rx="40" ry="12" fill="#E5E7EB" />
            <circle cx="80" cy="80" r="40" fill="#FFF" stroke="#A7F3D0" strokeWidth="4" />
            <path d="M65 90c5 5 15 5 20 0" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
            <circle cx="70" cy="75" r="4" fill="#34D399" />
            <circle cx="90" cy="75" r="4" fill="#34D399" />
          </svg>
          <div className="mt-6 text-xl font-semibold text-gray-600">No results found</div>
          <div className="mt-2 text-gray-400">Try a different search or check your spelling!</div>
        </div>
      )}
      {list.length > 0 && <MangaGrid items={list.map(item => ({
        ...item,
        // Pass both original and hyphenated name for display and URL
        _originalName: item.name,
        name: typeof item.name === 'string'
          ? item.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
          : undefined,
      }))} />}
    {list.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-6">
  <Link href={`/search?query=${encodeURIComponent(filters.query)}&page=${Math.max(1, page - 1)}&sort=${encodeURIComponent(sort)}`}
            className={page === 1 ? 'opacity-40 cursor-default pointer-events-none' : ''}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : 0}
          >Prev</Link>
          <span>Page {page}</span>
  <Link href={`/search?query=${encodeURIComponent(filters.query)}&page=${page + 1}&sort=${encodeURIComponent(sort)}`}
            className={!hasNext ? 'opacity-40 cursor-default pointer-events-none' : ''}
            aria-disabled={!hasNext}
            tabIndex={!hasNext ? -1 : 0}
          >Next</Link>
        </div>
      )}
    </main>
  );
}
