'use client';
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaGrid from "../../components/MangaGrid";
import Link from "next/link";

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

    const timeoutId = setTimeout(() => setShowNoResults(true), 5000);

    fetch(`${API}?query=${encodeURIComponent(q)}&page=${page}&limit=${limit}`)
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
      })
      .catch(() => setError("Failed to fetch search results."))
      .finally(() => {
        setLoading(false);
        clearTimeout(timeoutId);
        setShowNoResults(false);
      });

    return () => clearTimeout(timeoutId);
  }, [q, page]);

  const hasPrev = page > 1;
  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-6">
      {loading && <div>Loading…</div>}
      {q && list.length === 0 && showNoResults && <div>No results found.</div>}
      {list.length > 0 && <MangaGrid items={list.map(item => ({ ...item }))} />}
      {list.length > 0 && (
        <div className="flex items-center justify-between gap-2 mt-6">
          <Link href={`/search?query=${encodeURIComponent(q)}&page=${Math.max(1, page - 1)}`}>Prev</Link>
          <span>Page {page}</span>
          <Link href={`/search?query=${encodeURIComponent(q)}&page=${page + 1}`}>Next</Link>
        </div>
      )}
    </main>
  );
}
