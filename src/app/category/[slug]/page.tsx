
"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import MangaCardRef from '@/components/MangaCardRef';
import SubHeader from '@/components/SubHeader';

const API_BASE = 'https://api.manhwagalaxy.org/manhwa';

export default function CategoryPage() {
 const { slug } = useParams<{ slug: string }>();
 // Only define 'category' once
 const category = decodeURIComponent(slug || '');
  const router = useRouter();

  React.useEffect(() => {
    document.title = `${category} Manga - Read ${category} Manhwa Online | ManhwaGalaxy`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Browse and read the latest ${category} manhwa chapters online for free at ManhwaGalaxy. Discover new releases and bookmark your favorites.`;
  }, [category]);
 
  // Redirect special values back to home (client side)
  useEffect(() => {
    if (category === 'All Manga' || category === 'Latest') {
      router.replace('/');
    }
  }, [category, router]);

  const PAGE_SIZE = 24;
  interface MangaItem {
    name: string;
    cover_image?: string;
    rating?: number;
    last_chapter?: string;
    posted_on?: string;
    updated_at?: string;
    genres?: string[];
    genre?: string;
    image?: string;
    title?: string;
    [key: string]: unknown;
  }
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPage(1); }, [category]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const genreParam = `&genre=${encodeURIComponent(category)}`;
    fetch(`${API_BASE}?page=${page}&limit=${PAGE_SIZE}${genreParam}`)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        setItems(data.results || []);
        setHasNextPage((data.results || []).length === PAGE_SIZE);
        if (typeof data.total === 'number') {
          setTotalPages(Math.ceil(data.total / PAGE_SIZE));
        }
      })
      .catch(() => active && setError('Failed to load list.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, category]);

  const renderSkeletons = () => (
    <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <li key={i} className="h-full">
          <div className="rounded-md overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="aspect-[3/4.3] shimmer" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 rounded bg-[var(--color-border)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--color-border)]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  const pageButtons = () => {
    const nodes: React.ReactNode[] = [];
    const windowSize = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 3) end = Math.min(totalPages, windowSize);
    if (page >= totalPages - 2) start = Math.max(1, totalPages - windowSize + 1);
    const baseBtn = 'px-3 py-2 rounded-md text-xs font-semibold border transition cursor-pointer disabled:cursor-default';
    if (start > 1) {
      nodes.push(
        <button key={1} onClick={() => setPage(1)} disabled={page === 1} className={`${baseBtn} ${page === 1 ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>1</button>
      );
      if (start > 2) nodes.push(<span key="s-ellipsis" className="px-2 text-[var(--color-text-dim)]">…</span>);
    }
    for (let i = start; i <= end; i++) {
      nodes.push(
        <button key={i} onClick={() => setPage(i)} disabled={page === i} className={`${baseBtn} ${page === i ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>{i}</button>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) nodes.push(<span key="e-ellipsis" className="px-2 text-[var(--color-text-dim)]">…</span>);
      nodes.push(
        <button key={totalPages} onClick={() => setPage(totalPages)} disabled={page === totalPages} className={`${baseBtn} ${page === totalPages ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>{totalPages}</button>
      );
    }
    return nodes;
  };


  return (
    <main className="container-page">
      <div className="mb-5">
        <SubHeader />
      </div>
      {category && category !== 'Latest' && category !== 'All Manga' && (
        <h2 className="text-sm font-semibold mb-4 text-[var(--color-text-dim)]">Genre: <span className="text-[var(--color-text)]">{category}</span></h2>
      )}
      {error ? (
        <div className="mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex flex-col items-center">
          <span className="font-semibold text-base mb-2">Oops! Something went wrong.</span>
          <span className="mb-3">{error}</span>
          <button
            onClick={() => { setError(null); setLoading(true); setPage(1); }}
            className="px-4 py-2 rounded bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition"
          >Retry</button>
        </div>
      ) : loading ? (
        renderSkeletons()
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 fade-in">
          {items.map((item: MangaItem) => (
            <li key={item.name} className="list-none">
              <MangaCardRef
                title={item.name}
                imageUrl={item.cover_image || ""}
                mangaUrl={`/details/${encodeURIComponent(item.name)}`}
                rating={item.rating}
                lastChapter={item.last_chapter}
                postedOn={item.posted_on || item.updated_at || ''}
                colored={false}
                hot={false}
              />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && !loading && !error && (
        <div className="flex flex-wrap justify-center items-center gap-2 py-10">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            aria-label="First page"
          >First</button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            aria-label="Previous page"
          >Prev</button>
          {pageButtons()}
          <button
            onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
            disabled={page === totalPages || !hasNextPage}
            className="px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            aria-label="Next page"
          >Next</button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            aria-label="Last page"
          >Last</button>
        </div>
      )}
    </main>
  );
}
