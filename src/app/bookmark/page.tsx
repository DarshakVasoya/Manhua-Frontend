'use client';
import React, { useEffect, useState } from 'react';

interface BookmarkEntry {
  name: string;
  cover_image?: string;
  rating?: number|string;
  last_chapter?: string;
  addedAt: number;
}

export default function BookmarkPage(){
  const [items, setItems] = useState<BookmarkEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const STORAGE_KEYS = ['bookmarks:v1', 'bookmarks'];

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
      } else {
        setItems([]);
      }
    } catch { setItems([]); }
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
          <span>No bookmarks yet. Visit a series detail page and press the bookmark icon.</span>
          <button onClick={load} className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]">Refresh</button>
        </div>
      )}
      {items.length>0 && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <li key={item.name} className="group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden flex">
              <a href={`/details/${encodeURIComponent(item.name)}`} className="flex flex-1 items-stretch">
                {item.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.cover_image} alt={item.name} className="w-28 h-full object-cover border-r border-[var(--color-border)]" loading="lazy" />
                ) : (
                  <div className="w-28 h-full bg-[var(--color-bg-alt)] flex items-center justify-center text-[10px] text-[var(--color-text-dim)]">No Image</div>
                )}
                <div className="flex-1 p-3 flex flex-col">
                  <h2 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-white transition">{item.name}</h2>
                  <div className="mt-auto flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]">
                    {item.rating && <span className="px-1.5 py-0.5 rounded bg-[var(--color-bg-alt)]/60 border border-[var(--color-border)] text-amber-300 font-medium">⭐ {item.rating}</span>}
                    {item.last_chapter && <span className="px-1.5 py-0.5 rounded bg-[var(--color-bg-alt)]/60 border border-[var(--color-border)] text-emerald-300 font-medium">{item.last_chapter}</span>}
                  </div>
                </div>
              </a>
              <button onClick={(e)=>{ e.preventDefault(); removeOne(item.name); }} className="absolute top-2 right-2 p-1.5 rounded-md bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 text-[10px] text-white">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
