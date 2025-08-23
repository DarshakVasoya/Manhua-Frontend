"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import MangaCardRef from '@/components/MangaCardRef';
import SubHeader from '@/components/SubHeader';

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

const API_BASE = 'https://api.manhwagalaxy.org/manhwa';

export default function HomeClient() {
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
  useEffect(() => {
    document.title = "ManhwaGalaxy - Read Free Manhwa Online";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Discover and read the latest manhwa chapters online for free at ManhwaGalaxy. Browse genres, bookmark favorites, and stay updated with new releases.";
  }, []);
  const PAGE_SIZE = 24;
  const [items, setItems] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get('page') || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch listing
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}?page=${page}&limit=${PAGE_SIZE}`)
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
  }, [page]);

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
        <button key={1} onClick={() => router.push('/?page=1')} disabled={page === 1} className={`${baseBtn} ${page === 1 ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>1</button>
      );
      if (start > 2) nodes.push(<span key="s-ellipsis" className="px-2 text-[var(--color-text-dim)]">…</span>);
    }
    for (let i = start; i <= end; i++) {
      nodes.push(
        <button key={i} onClick={() => router.push(`/?page=${i}`)} disabled={page === i} className={`${baseBtn} ${page === i ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>{i}</button>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) nodes.push(<span key="e-ellipsis" className="px-2 text-[var(--color-text-dim)]">…</span>);
      nodes.push(
        <button key={totalPages} onClick={() => router.push(`/?page=${totalPages}`)} disabled={page === totalPages} className={`${baseBtn} ${page === totalPages ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>{totalPages}</button>
      );
    }
    return nodes;
  };

  return (
    <main className="container-page">
      {!isOnline && (
        <div className="mb-4 p-4 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-700 flex items-center justify-center">
          <span className="font-semibold text-base mr-2">You are offline.</span>
          <span>Please check your internet connection.</span>
        </div>
      )}
      <div className="mb-5">
        <SubHeader />
      </div>
      {error ? (
        <div className="mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex flex-col items-center">
          <span className="font-semibold text-base mb-2">Oops! Something went wrong.</span>
          <span className="mb-3">{error}</span>
          <button
            onClick={() => { setError(null); setLoading(true); router.push('/?page=1'); }}
            className="px-4 py-2 rounded bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition"
          >Retry</button>
        </div>
      ) : loading ? (
        renderSkeletons()
      ) : (
        <>
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 fade-in">
            {items.map((item: MangaItem) => (
              <li key={item.name} className="list-none">
                <MangaCardRef
                  title={item.name}
                  imageUrl={item.cover_image || ""}
                  mangaUrl={`/details/${item.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`}
                  rating={item.rating}
                  lastChapter={item.last_chapter}
                  postedOn={item.posted_on || item.updated_at || ''}
                  colored={false}
                  hot={false}
                />
              </li>
            ))}
          </ul>
        </>
      )}
      {/* Pagination */}
      {totalPages > 1 && !loading && !error && (
        <div className="flex flex-wrap justify-center items-center gap-2 py-10">
          <Link
            href={`?page=1`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${page === 1 ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'}`}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : 0}
          >First</Link>
          <Link
            href={`?page=${Math.max(1, page - 1)}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${page === 1 ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'}`}
            aria-disabled={page === 1}
            tabIndex={page === 1 ? -1 : 0}
          >Prev</Link>
          {pageButtons()}
          <Link
            href={`?page=${page < totalPages ? page + 1 : page}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${(page === totalPages || !hasNextPage) ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'}`}
            aria-disabled={page === totalPages || !hasNextPage}
            tabIndex={(page === totalPages || !hasNextPage) ? -1 : 0}
          >Next</Link>
          <Link
            href={`?page=${totalPages}`}
            className={`px-3 py-2 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] ${page === totalPages ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer'}`}
            aria-disabled={page === totalPages}
            tabIndex={page === totalPages ? -1 : 0}
          >Last</Link>
         
        </div>
      )}
    </main>
  );
}
