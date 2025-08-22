import React from "react";
import MangaGrid from "../../components/MangaGrid";

const API = "http://165.232.60.4:8000/manhwa/search";

const genresOf = (it: any): string[] =>
  Array.isArray(it?.genres)
    ? it.genres
    : typeof it?.genre === "string"
    ? it.genre.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams;
  const q = (Array.isArray(params?.query) ? params.query[0] : params?.query) || "";
  const page = Number(Array.isArray(params?.page) ? params.page[0] : params?.page) || 1;
  const limit = 24;

  let list: any[] = [];
  let error: string | null = null;

  if (q.trim()) {
    try {
      const url = `${API}?query=${encodeURIComponent(q.trim())}&page=${page}&limit=${limit}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      list = Array.isArray(json) ? json : (Array.isArray(json?.results) ? json.results : []);
    } catch {
      error = "Failed to fetch search results.";
    }
  }

  const genreSet = new Set<string>();
  list.forEach((it) => genresOf(it).forEach((g) => genreSet.add(g)));
  const genres = Array.from(genreSet).sort((a, b) => a.localeCompare(b));

  const hasPrev = page > 1;
  const hasNext = list.length >= limit;

  return (
    <main className="container-page max-w-5xl mx-auto py-6">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
        Search results for “{q || "…"}”
      </h1>

      {error && <div className="text-sm text-red-400 mb-6">{error}</div>}

      {!q.trim() && (
        <div className="text-sm text-[var(--color-text-dim)]">Type a search above and press Go.</div>
      )}

      {q.trim() && genres.length > 0 && (
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

      {q.trim() && list.length === 0 && !error && (
        <div className="text-sm text-[var(--color-text-dim)]">No results found.</div>
      )}

      {list.length > 0 && <MangaGrid items={list} />}

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