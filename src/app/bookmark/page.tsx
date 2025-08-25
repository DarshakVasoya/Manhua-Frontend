

"use client";
import React, { useEffect, useState } from 'react';
import MangaCardRef from '../../components/MangaCardRef';


interface BookmarkEntry {
  name: string;
  cover_image?: string;
  rating?: number|string;
  last_chapter?: string;
  posted_on?: string;
  addedAt: number;
}

export default function BookmarkPage(){
  const [items, setItems] = useState<BookmarkEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const STORAGE_KEYS = ['bookmarks:v1', 'bookmarks'];
    // Utility to format title
    function formatTitle(str: string) {
      return str.replace(/-/g, ' ').replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

  const load = () => {
    try {
      let found: BookmarkEntry[] = [];
      for(const k of STORAGE_KEYS){
        const raw = localStorage.getItem(k);
        if(!raw) continue;
        try {
          const arr = JSON.parse(raw);
          if(Array.isArray(arr)){
            found = arr as BookmarkEntry[];
            break;
          }
        } catch {}
      }
      if(found.length){
        const seen = new Set<string>();
        const dedup: BookmarkEntry[] = [];
        for(const e of found){ if(e && e.name && !seen.has(e.name)){ seen.add(e.name); dedup.push(e);} }
        dedup.sort((a,b)=> (b.addedAt||0) - (a.addedAt||0));
        setItems(dedup);
        setError(null);
      } else {
        setItems([]);
        setError(null);
      }
    } catch {
      setItems([]);
      setError('Failed to load bookmarks. Please try again.');
    }
  };

  useEffect(()=>{
    setMounted(true);
    load();
    const onVis = () => { if(document.visibilityState==='visible') load(); };
    const onStorage = (e: StorageEvent) => { if(STORAGE_KEYS.includes(e.key||'')) load(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('storage', onStorage);
    };
  },[]);

  const removeOne = (name: string) => {
    setItems(list => {
      const filtered = list.filter(i=> i.name!==name);
      try { localStorage.setItem('bookmarks:v1', JSON.stringify(filtered)); } catch {}
      return filtered;
    });
  };

  if(!mounted){
    return <main className="container-page max-w-5xl mx-auto py-10"><h1 className="text-2xl font-bold mb-6">Bookmarks</h1><div className="text-sm text-[var(--color-text-dim)]">Loading…</div></main>;
  }

  return (
    <main className="container-page max-w-5xl mx-auto py-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Bookmarks</h1>
      {items.length===0 && (
        <div className="text-sm text-[var(--color-text-dim)] border border-[var(--color-border)] rounded-lg p-6 bg-[var(--color-bg-alt)] flex items-center justify-between gap-4">
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex flex-col items-center">
            <span className="font-semibold text-base mb-2">Oops! Something went wrong.</span>
            <span className="mb-3">{error}</span>
            <button
              onClick={load}
              className="px-4 py-2 rounded bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition"
            >Retry</button>
          </div>
        )}
          <span>No bookmarks yet. Visit a series detail page and press the bookmark icon.</span>
          <button onClick={load} className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]">Refresh</button>
        </div>
      )}
      {items.length>0 && (
   <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 fade-in">
          {items.map((item, idx) => (
            <li key={item.name} className="list-none">
              <MangaCardRef
                title={item.name}
                imageUrl={item.cover_image || ''}
                mangaUrl={`/details/${encodeURIComponent(item.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}`}
                rating={item.rating}
                lastChapter={item.last_chapter}
                postedOn={item.posted_on}
                index={idx}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
