"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from "next/link"

import { useParams, useRouter } from 'next/navigation';

// Minimal view with breadcrumb and chapter number.
// Simple in-memory cache for chapter image data across navigations
// Key: `${seriesName}__${chapterNumber}`
interface CachedChapterData { images: string[]; date?: string; label?: string; }
interface ChapterMeta {
  chapter_number: string | number;
  chapternum?: string | number;
  chapter?: string | number;
  rawLabel?: string;
}
declare global {
  var __chapterImageCache: Record<string, CachedChapterData> | undefined;
  var __chapterListCache: Record<string, ChapterMeta[]> | undefined;
}
const chapterImageCache: Record<string, CachedChapterData> = globalThis.__chapterImageCache || {};
if(!globalThis.__chapterImageCache){
  globalThis.__chapterImageCache = chapterImageCache;
}

export default function ChapterNumberOnly() {
  // ...existing code...
  const params = useParams();
  const router = useRouter();
  const rawName = params?.name as string | string[] | undefined;
  const chapter_number = params?.chapter_number as string;
  const nameJoined = Array.isArray(rawName) ? rawName.join('/') : (rawName || '');
  const decoded = decodeURIComponent(nameJoined);

  useEffect(() => {
    document.title = `${decoded} - Chapter ${chapter_number} | ManhwaGalaxy`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Read ${decoded} Chapter ${chapter_number} online at ManhwaGalaxy. Stay updated with the latest chapters.`;
  }, [decoded, chapter_number]);

  // Chapter list state (lightweight)
  interface ChapterMeta {
    chapter_number: string | number;
    chapternum?: string | number;
    chapter?: string | number;
    rawLabel?: string;
  }
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  // Cache chapter list per series name (in-memory)
  const chapterListCache: Record<string, ChapterMeta[]> = globalThis.__chapterListCache || {};
  if(!globalThis.__chapterListCache){ globalThis.__chapterListCache = chapterListCache; }

  // Generate name variants (same logic used elsewhere) for resilience
  const genNameVariants = (base: string): string[] => {
    const variants = new Set<string>();
    const trimmed = base.trim();
    const replacedQuotes = trimmed.replace(/[\u2018\u2019\u201C\u201D]/g, "'");
    const collapsed = replacedQuotes.replace(/\s+/g,' ');
    const noPunct = collapsed.replace(/['"()!?,.:;]+/g,'');
    const ascii = noPunct.normalize('NFKD').replace(/[^\w\s-]/g,'').trim();
    const slug = ascii.toLowerCase().replace(/\s+/g,'-');
    [trimmed, replacedQuotes, collapsed, noPunct, ascii, slug].forEach(v=>{ if(v && v.length>=2) variants.add(v); });
    return Array.from(variants);
  };

  // Fetch chapter list once (minimal endpoints) to enable prev/next + dropdown
  useEffect(()=>{
    let active = true;
    if(!decoded) return;
    const cacheKey = decoded;
    const cached = chapterListCache[cacheKey];
    if(cached){
      setChapters(cached);
      return;
    }
    setLoadingChapters(true);
    const variants = genNameVariants(decoded);
    const endpoints: string[] = [];
    variants.forEach(v=>{
      const enc = encodeURIComponent(v);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters?order=esc`);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters?order=asc`);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters`);
    });
    (async ()=>{
      for(const url of endpoints){
        try {
          const r = await fetch(url);
          if(!r.ok) continue;
          const data = await r.json();
          if(Array.isArray(data)){
            // Normalize numeric
              const mapped: ChapterMeta[] = data.map((c:ChapterMeta, idx:number)=>{
                const rawLabel = String(c.chapternum || c.chapter || c.chapter_number || `Chapter ${idx+1}`);
                const numMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(rawLabel);
                const parsedNum = numMatch ? numMatch[1] : String(c.chapter_number ?? idx+1);
                return { chapter_number: parsedNum, rawLabel };
              });
            // Sort ascending
            mapped.sort((a,b)=>{
              const an = parseFloat(String(a.chapter_number));
              const bn = parseFloat(String(b.chapter_number));
              if(isNaN(an) || isNaN(bn)) return 0; return an - bn;
            });
            if(active){ setChapters(mapped); chapterListCache[cacheKey] = mapped; }
            break;
          }
        } catch(e){ /* ignore and try next */ }
      }
      if(active) setLoadingChapters(false);
    })();
    return ()=> { active = false; };
  }, [decoded]);

  // Derive prev/next
  const currentIndex = useMemo(()=> chapters.findIndex(c=> String(c.chapter_number)===String(chapter_number)), [chapters, chapter_number]);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex >=0 && currentIndex < chapters.length -1 ? chapters[currentIndex + 1] : null;
  const chaptersDesc = useMemo(()=> [...chapters].reverse(), [chapters]); // latest first in dropdown

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value; if(!value) return;
    router.push(value);
  };

  const chapterNumLabel = `Chapter ${chapter_number}`;
  const descriptionText = `Read ${decoded} ${chapterNumLabel} online at ManhwaGalaxy. Stay updated with the latest chapters.`;

  // Chapter images/content state
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string|null>(null);
  const [chapterImages, setChapterImages] = useState<string[]>([]);
  const [chapterDate, setChapterDate] = useState<string|undefined>(undefined);
  const [chapterLabel, setChapterLabel] = useState<string|undefined>(undefined);
  // Progressive reveal state
  const BATCH_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [autoAdvance, setAutoAdvance] = useState(false); // reserved if we want auto-next later
  const triggerRef = React.useRef<HTMLImageElement | null>(null);
  // Per-image load + error tracking
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<number, number>>({});
  const [overrideSrc, setOverrideSrc] = useState<Record<number, string>>({});

  // Fetch chapter images
  useEffect(()=>{
    let active = true;
    if(!decoded || !chapter_number) return;
    const cacheKey = `${decoded}__${chapter_number}`;
    const cached = chapterImageCache[cacheKey];
    setChapterLoading(true); setChapterError(null); setChapterImages([]);
    setVisibleCount(BATCH_SIZE);
    setLoadedMap({}); setErrorMap({}); setOverrideSrc({});
    if(cached){
      // Hydrate from cache instantly
      setChapterImages(cached.images);
      setChapterDate(cached.date);
      setChapterLabel(cached.label);
      setChapterLoading(false);
      return; // Skip network fetch
    }
    const variants = genNameVariants(decoded);
    const endpoints: string[] = [];
    variants.forEach(v=>{
      const enc = encodeURIComponent(v);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${chapter_number}?order=desc`);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${chapter_number}?order=asc`);
  endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${chapter_number}`);
    });
    (async()=>{
  let lastErr: string | number | Error | null = null;
      for(const url of endpoints){
        try {
          const r = await fetch(url);
          if(!r.ok) { lastErr = r.status; continue; }
          const data = await r.json();
          if(data && Array.isArray(data.images)){
            if(!active) return;
            setChapterImages(data.images);
            setChapterDate(data.chapterdate || data.date);
            setChapterLabel(data.chapternum || data.chapter || data.chapter_number);
            chapterImageCache[cacheKey] = { images: data.images, date: data.chapterdate || data.date, label: data.chapternum || data.chapter || data.chapter_number };
            setChapterLoading(false);
            return;
          }
  } catch(e){ lastErr = e as Error; }
      }
      if(active){ setChapterError('Failed to load chapter images'); setChapterLoading(false); }
    })();
    return ()=> { active = false; };
  }, [decoded, chapter_number]);

  // Prefetch next chapter earlier (after 60% loaded OR last 5 loaded OR second batch shown)
  useEffect(()=>{
    if(!next || !decoded) return;
    const nextKey = `${decoded}__${next.chapter_number}`;
    if(chapterImageCache[nextKey]) return; // already prefetched
    if(!chapterImages.length) return;
    const total = chapterImages.length;
    const loadedCount = Object.keys(loadedMap).filter(k=>loadedMap[Number(k)]).length;
    const lastSegmentStart = Math.max(0, total - 5);
    let lastFiveReady = true;
    for(let i = lastSegmentStart; i < total; i++){
      if(!loadedMap[i]) { lastFiveReady = false; break; }
    }
    const sixtyPercentLoaded = (loadedCount / total) >= 0.6;
    const advancedVisible = visibleCount >= BATCH_SIZE * 2;
    if(!(lastFiveReady || sixtyPercentLoaded || advancedVisible)) return;
    let aborted = false;
    (async()=>{
      try {
        const variants = genNameVariants(decoded);
        const endpoints: string[] = [];
        variants.forEach(v=>{
          const enc = encodeURIComponent(v);
    endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${next.chapter_number}?order=desc`);
    endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${next.chapter_number}?order=asc`);
    endpoints.push(`https://api.manhwagalaxy.org/manhwa/${enc}/chapters/${next.chapter_number}`);
        });
        let found: CachedChapterData | null = null;
        for(const url of endpoints){
          try {
            const r = await fetch(url, { cache: 'force-cache' });
            if(!r.ok) continue;
            const data = await r.json();
            if(data && Array.isArray(data.images)){
              found = { images: data.images, date: data.chapterdate || data.date, label: data.chapternum || data.chapter || data.chapter_number };
              break;
            }
          } catch{/* ignore */}
        }
        if(!found || aborted) return;
        chapterImageCache[nextKey] = found;
        // Warm image cache quietly with limited concurrency (up to 4 at a time)
        const concurrency = 4;
        const queue = [...found.images];
        const workers: Promise<void>[] = [];
        const fetchImage = async (imgUrl: string) => {
          try { await fetch(imgUrl, { mode: 'no-cors', cache: 'force-cache' }); } catch{/* ignore */}
        };
        for(let i=0;i<concurrency;i++){
          workers.push((async function run(){
            while(queue.length && !aborted){
              const u = queue.shift();
              if(!u) break;
              await fetchImage(u);
            }
          })());
        }
        await Promise.all(workers);
      } catch{/* swallow */}
    })();
    return ()=> { aborted = true; };
  }, [next, decoded, chapterImages, loadedMap]);

  // Update document title & meta description (basic SEO enhancement)
  useEffect(()=>{
    if(decoded && chapter_number){
      document.title = `${decoded} - Chapter ${chapter_number} | ManhwaGalaxy`;
      const existing = document.querySelector('meta[name="description"]');
      if(existing) existing.setAttribute('content', descriptionText);
      else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = descriptionText;
        document.head.appendChild(meta);
      }
    }
  }, [decoded, chapter_number, descriptionText]);

  // IntersectionObserver to grow visibleCount when the trigger image nears viewport
  useEffect(()=>{
    if(!chapterImages.length) return;
    if(visibleCount >= chapterImages.length) return;
    const el = triggerRef.current;
    if(!el) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          setVisibleCount(c => Math.min(c + BATCH_SIZE, chapterImages.length));
        }
      });
    }, { rootMargin: '200px 0px 200px 0px', threshold: 0.1 });
    observer.observe(el);
    return ()=> observer.disconnect();
  }, [chapterImages, visibleCount]);

  // Keyboard navigation (left/right arrow)
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if(e.key === 'ArrowLeft' && prev){
        e.preventDefault();
        router.push(`/details/${encodeURIComponent(decoded)}/chapters/${prev.chapter_number}`);
      } else if(e.key === 'ArrowRight' && next){
        e.preventDefault();
        router.push(`/details/${encodeURIComponent(decoded)}/chapters/${next.chapter_number}`);
      } else if(e.key === 'PageDown') {
        // If at end of images and autoAdvance desired (future flag)
        if(visibleCount >= chapterImages.length && next){
          router.push(`/details/${encodeURIComponent(decoded)}/chapters/${next.chapter_number}`);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [prev, next, decoded, chapterImages.length, visibleCount, router]);

  return (
  <main className="container-page max-w-2xl mx-auto py-10">
      <nav className="text-xs mb-6 text-[var(--color-text-dim)] flex gap-1 items-center">
       <Link href="/" className="hover:text-white">
  Home
</Link>
        <span>/</span>
        <a href={`/details/${encodeURIComponent(decoded)}`} className="hover:text-white truncate max-w-[240px]" title={decoded}>{decoded}</a>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{chapterNumLabel}</h1>
      <p className="text-xs text-[var(--color-text-dim)] mb-6 leading-relaxed">{descriptionText}</p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <select value={`/details/${encodeURIComponent(decoded)}/chapters/${chapter_number}`} onChange={onSelect} className="px-3 h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium focus:outline-none focus:border-[var(--color-accent)] w-full sm:w-auto min-w-[200px]">
          <option value="" disabled>{loadingChapters ? 'Loading…' : 'Select Chapter'}</option>
           {chaptersDesc.map((c, idx) => (
             <option key={`${c.chapter_number}-${idx}`} value={`/details/${encodeURIComponent(decoded)}/chapters/${c.chapter_number}`}>Chapter {c.chapter_number}</option>
           ))}
        </select>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button disabled={!prev} onClick={()=> prev && router.push(`/details/${encodeURIComponent(decoded)}/chapters/${prev.chapter_number}`)} className={`px-4 h-9 rounded-md border text-xs font-medium transition ${prev ? 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-40 cursor-not-allowed'}`}>Prev</button>
          <button disabled={!next} onClick={()=> next && router.push(`/details/${encodeURIComponent(decoded)}/chapters/${next.chapter_number}`)} className={`px-4 h-9 rounded-md border text-xs font-medium transition ${next ? 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-40 cursor-not-allowed'}`}>Next</button>
        </div>
  {/* Total count removed as requested */}
      </div>
      <section className="mt-6">
        {/* Chapter label & date removed as requested */}
        {chapterLoading ? (
          <div className="text-sm text-[var(--color-text-dim)] py-8 text-center">Loading images…</div>
        ) : chapterError ? (
          <div className="text-sm text-red-400 py-8 text-center">{chapterError}</div>
        ) : null}
  <div className="flex flex-col items-center gap-0">
          {chapterImages.slice(0, visibleCount).map((origSrc, idx)=>{
            const src = overrideSrc[idx] || origSrc;
            const isTrigger = idx === Math.min(visibleCount, chapterImages.length) - 2 && visibleCount < chapterImages.length; // 4th, 9th, etc.
            const loaded = loadedMap[idx];
            const hadError = !!errorMap[idx];
            const retry = () => {
              setErrorMap(m => ({...m, [idx]: (m[idx]||0)+1 }));
              setLoadedMap(m => ({...m, [idx]: false}));
              setOverrideSrc(m => ({...m, [idx]: origSrc + (origSrc.includes('?')?'&':'?') + 'retry=' + Date.now()}));
            };
            return (
              <div key={idx} className="w-full flex flex-col items-center">
                <div className="relative w-full flex justify-center overflow-hidden">
                  {!loaded && !hadError && (
                    <div className="flex items-center justify-center w-full" style={{ minHeight: '700px' }}>
                      <div className="shimmer rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center" style={{ width: '100%', maxWidth: '900px', height: '700px', display: 'flex' }}>
                        <span className="text-[14px] text-[var(--color-text-dim)]">Loading image…</span>
                      </div>
                    </div>
                  )}
                  {hadError && !loaded && (
                    <button type="button" onClick={retry} className="w-full h-[400px] max-h-[70vh] flex flex-col gap-2 items-center justify-center text-[11px] font-medium bg-[var(--color-bg-alt)] text-[var(--color-text-dim)] hover:text-white">
                      <span>Image failed to load</span>
                      <span className="px-2 py-1 rounded bg-[var(--color-accent)] text-white text-[10px]">Tap to retry</span>
                    </button>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={el => { if(isTrigger) triggerRef.current = el; if(!isTrigger && triggerRef.current === el) triggerRef.current = null; }}
                    src={src}
                    alt={`${chapterNumLabel} page ${idx+1}`}
                    loading={idx===0 ? 'eager' : 'lazy'}
                    {...(idx===0 ? { fetchPriority: 'high' as const } : {})}
                    decoding="async"
                    onLoad={() => setLoadedMap(m => ({...m, [idx]: true}))}
                    onError={() => setErrorMap(m => ({...m, [idx]: (m[idx]||0)+1 }))}
                    className={`max-w-[800px] w-full h-auto object-contain select-none transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${hadError ? 'hidden' : ''}`}
                    // @ts-expect-error vendor style
style={{ WebkitUserDrag: 'none' }}
                  />
                </div>
              </div>
            );
          })}
          {visibleCount < chapterImages.length && (
            <div className="text-[11px] text-[var(--color-text-dim)] py-4">Loading next pages…</div>
          )}
        </div>
        {/* Bottom navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-10">
          <select value={`/details/${encodeURIComponent(decoded)}/chapters/${chapter_number}`} onChange={onSelect} className="px-3 h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium focus:outline-none focus:border-[var(--color-accent)] w-full sm:w-auto min-w-[200px]">
            <option value="" disabled>{loadingChapters ? 'Loading…' : 'Select Chapter'}</option>
             {chaptersDesc.map((c, idx) => (
               <option key={`${c.chapter_number}-${idx}`} value={`/details/${encodeURIComponent(decoded)}/chapters/${c.chapter_number}`}>Chapter {c.chapter_number}</option>
             ))}
          </select>
          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Mobile: absolute left/right, Desktop: inline */}
            <button
              disabled={!prev}
              onClick={() => prev && router.push(`/details/${encodeURIComponent(decoded)}/chapters/${prev.chapter_number}`)}
              className={`px-4 h-9 rounded-md border text-xs font-medium transition
                ${prev ? 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-40 cursor-not-allowed'}
                sm:static sm:order-1
                fixed left-2 bottom-20 z-20 sm:relative sm:left-0 sm:bottom-0
                w-20 sm:w-auto
                block sm:inline-block
              `}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >Prev</button>
            <button
              disabled={!next}
              onClick={() => next && router.push(`/details/${encodeURIComponent(decoded)}/chapters/${next.chapter_number}`)}
              className={`px-4 h-9 rounded-md border text-xs font-medium transition
                ${next ? 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]' : 'bg-[var(--color-surface)] border-[var(--color-border)] opacity-40 cursor-not-allowed'}
                sm:static sm:order-2
                fixed right-2 bottom-20 z-20 sm:relative sm:right-0 sm:bottom-0
                w-20 sm:w-auto
                block sm:inline-block
              `}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >Next</button>
          </div>
        </div>
      </section>
    </main>
  );
}
