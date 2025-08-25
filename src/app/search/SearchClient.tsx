'use client';
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaGrid from "../../components/MangaGrid";
import Link from "next/link";
import { AdvancedSearchBar } from "../../components/AdvancedSearchBar";

const API = "https://api.manhwagalaxy.org/manhwa/search";

interface MangaItem {
  genres?: string[];
  genre?: string;
  [key: string]: unknown;
}

const genresOf = (it: MangaItem): string[] =>
  Array.isArray(it?.genres)
    ? it.genres
    : typeof it?.genre === "string"
    ? it.genre.split(",").map(s => s.trim()).filter(Boolean)
    : [];

export default function SearchClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("query") || "").trim();
  const page = Number(searchParams.get("page") || 1);
  const limit = 24;

  const [list, setList] = useState<MangaItem[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [filters, setFilters] = useState({
    genres: [] as string[],
  });

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

  // Build filter query for new API
  const genreParam = Array.isArray(filters.genres) ? filters.genres.join(",") : filters.genres;
  const url = `https://api.manhwagalaxy.org/manhwa/search?query=${encodeURIComponent(q)}&genre=${encodeURIComponent(genreParam)}&page=${page}&limit=${limit}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    })
    .then(json => {
      const items: MangaItem[] = Array.isArray(json) ? json : Array.isArray(json?.results) ? json.results : [];
      setList(items);

      const genreSet = new Set<string>();
      items.forEach(it => genresOf(it).forEach(g => genreSet.add(g)));
      setGenres(Array.from(genreSet).sort((a, b) => a.localeCompare(b)));
      setShowNoResults(items.length === 0);
    })
    .catch(() => {
      setError("Failed to fetch search results.");
      setShowNoResults(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [q, page, filters]);

  const hasPrev = page > 1;
  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-1">
      <div className="mb-2">
        
        <AdvancedSearchBar onSearch={setFilters} />
      </div>
      {q && (
        <div className="mb-2 text-lg font-semibold text-[var(--color-accent)]">
          Showing results for: <span className="font-bold">{q}</span>
        </div>
      )}
      {loading && <div>Loading…</div>}
      {q && !loading && list.length === 0 && showNoResults && (
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
          <Link href={`/search?query=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}`}
            className={page === 1 ? 'opacity-40 cursor-default pointer-events-none' : ''}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : 0}
          >Prev</Link>
          <span>Page {page}</span>
          <Link href={`/search?query=${encodeURIComponent(q)}&page=${page + 1}`}
            className={!hasNext ? 'opacity-40 cursor-default pointer-events-none' : ''}
            aria-disabled={!hasNext}
            tabIndex={!hasNext ? -1 : 0}
          >Next</Link>
        </div>
      )}
    </main>
  );
}
