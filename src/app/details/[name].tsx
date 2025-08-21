"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = 'http://165.232.60.4:8000/manhwa';

export default function DetailsPage() {
  const params = useParams();
  // Support slug arrays if Next encoded special chars differently
  const rawParam = (params?.name as any);
  const name = Array.isArray(rawParam) ? rawParam.join('/') : rawParam;
  const [details, setDetails] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const storageKey = 'bookmarks:v1';

  // Load bookmark state
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(storageKey);
      if(raw){
        const arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          setBookmarked(arr.some((b:any)=> b.name === decodeURIComponent(name)));
        }
      }
    } catch {}
  }, [name]);

  useEffect(() => {
    if (!name) return;
    fetch(`${API_BASE}/${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => setDetails(data));
    fetch(`${API_BASE}/${encodeURIComponent(name)}/chapters`)
      .then(res => res.json())
      .then(data => setChapters(data));
  }, [name]);

  const toggleBookmark = () => {
    setBookmarked(prev => {
      const next = !prev;
      try {
        const raw = localStorage.getItem(storageKey);
        let arr: any[] = []; if(raw){ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) arr = parsed; }
        const decodedName = decodeURIComponent(name);
        if(next){
          // Add or update
          if(!arr.some(e=> e.name === decodedName)){
            arr.push({ name: decodedName, cover_image: details?.cover_image, rating: details?.rating, last_chapter: details?.last_chapter, addedAt: Date.now() });
          }
        } else {
          arr = arr.filter(e=> e.name !== decodedName);
        }
        localStorage.setItem(storageKey, JSON.stringify(arr));
      } catch {}
      return next;
    });
  };

  // Update document title early
  useEffect(() => {
    if (name) {
      const prev = document.title;
      document.title = `${decodeURIComponent(name)} | ManhwaGalaxy`;
      return () => { document.title = prev; };
    }
  }, [name]);

  if (!details) return (
    <main className="container-page max-w-5xl mx-auto">
      <nav className="text-xs mb-4 text-[var(--color-text-dim)] flex gap-1"> <a href="/" className="hover:text-white">Home</a> <span>/</span> <span className="truncate max-w-[260px]">{decodeURIComponent(name || '')}</span></nav>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{decodeURIComponent(name || '')}</h1>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 text-sm text-[var(--color-text-dim)]">Loading details…</div>
    </main>
  );

  return (
    <main className="container-page max-w-5xl mx-auto">
      <nav className="text-xs mb-4 text-[var(--color-text-dim)] flex gap-1"> <a href="/" className="hover:text-white">Home</a> <span>/</span> <span className="truncate max-w-[260px]">{name}</span></nav>
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-6 flex flex-col md:flex-row items-start gap-8 mb-8 relative">
        {details.cover_image && (
          <div className="w-56 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={details.cover_image} alt={details.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex-1 leading-tight">{details.name}</h1>
            <button
              type="button"
              onClick={toggleBookmark}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className={`group relative w-11 h-11 shrink-0 rounded-lg border border-[var(--color-border)] flex items-center justify-center transition bg-[var(--color-surface)] hover:border-[var(--color-accent)] ${bookmarked ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-alt)]`}
            >
              {/* Icon: bookmark with filled variant */}
              {bookmarked ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="drop-shadow-sm">
                  <path d="M6 3.5A2.5 2.5 0 0 1 8.5 1h7A2.5 2.5 0 0 1 18 3.5V22l-6-4-6 4V3.5Z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm group-hover:scale-110 transition-transform">
                  <path d="M6 3.5A2.5 2.5 0 0 1 8.5 1h7A2.5 2.5 0 0 1 18 3.5V22l-6-4-6 4V3.5Z" />
                </svg>
              )}
              <span className="sr-only">{bookmarked ? 'Bookmarked' : 'Add bookmark'}</span>
              <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-bg-alt)] transition-opacity ${bookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></span>
            </button>
          </div>
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {details.rating && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-amber-300 font-semibold">⭐ {details.rating}</span>}
            {details.last_chapter && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-emerald-300 font-medium">{details.last_chapter}</span>}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-text-dim)] whitespace-pre-line max-w-prose">{details.description}</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-3">Chapters <span className="text-[var(--color-text-dim)] font-normal">({chapters.length})</span></h2>
      <div className="grid sm:grid-cols-2 gap-2 mb-12">
        {chapters.map((ch: any) => (
          <a key={ch.chapter_number} href={`/details/${encodeURIComponent(name)}/chapters/${ch.chapter_number}`} className="px-3 py-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs flex items-center justify-between hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition group">
            <span className="font-medium group-hover:text-white">Chapter {ch.chapter_number}</span>
            {ch.title && <span className="text-[var(--color-text-dim)] truncate max-w-[150px] ml-2">{ch.title}</span>}
          </a>
        ))}
      </div>
    </main>
  );
}
