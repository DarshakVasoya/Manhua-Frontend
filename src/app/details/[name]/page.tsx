"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useParams } from 'next/navigation';
const API_BASE = 'https://api.manhwagalaxy.org/manhwa';

interface Chapter {
  chapter_number: number | string;
  chapternum?: string | number;
  chapter?: string | number;
  chapterdate?: string;
  title?: string;
  link?: string;
  date?: string; // uploaded date
  rawLabel?: string; // original chapternum text
}

export default function DetailsPage(){
  const params = useParams();
  const raw = params?.name as string | string[];
  const name = Array.isArray(raw) ? raw.join('/') : raw;
  // Only define 'decoded' once
  const decoded = decodeURIComponent(name || '');
  React.useEffect(() => {
    document.title = `${decoded} | ManhwaGalaxy`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Read ${decoded} manga online at ManhwaGalaxy. Discover chapters, bookmark your favorites, and stay updated with the latest releases.`;
  }, [decoded]);
 


  
  interface MangaDetails {
    name: string;
    cover_image?: string;
    colored?: boolean;
    followers?: number;
    rating?: string;
    last_chapter?: string;
    posted_on?: string;
    alternative?: string;
    status?: string;
    type?: string;
    released?: string;
    author?: string;
    artist?: string;
    posted_by?: string;
    updated_on?: string;
    views?: number;
    genres?: string[];
    description?: string;
  }
  const [details, setDetails] = useState<MangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  // Client-side pagination (no URL params)
  const [page, setPage] = useState(1);
  // Chapters state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // const pageSize = 20; // chapters per page
   const ROWS_PER_PAGE = 10;
  const [cols, setCols] = useState(1);
  useEffect(() => {
    const calcCols = () => {
      const w = window.innerWidth || 0;
      // Tailwind breakpoints: sm:640, md:768, lg:1024
      setCols(w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1);
    };
    calcCols();
window.addEventListener("resize", calcCols, { passive: true });
window.addEventListener("orientationchange", calcCols, { passive: true });

return () => {
  window.removeEventListener("resize", calcCols);
  window.removeEventListener("orientationchange", calcCols);
};

  }, []);
  const pageSize = ROWS_PER_PAGE * cols;

  useEffect(() => {
    if(!decoded) return;
    let active = true;
    setLoading(true); setError(null);

    const genNameVariants = (base: string): string[] => {
      const variants = new Set<string>();
      const trimmed = base.trim();
      const replacedQuotes = trimmed.replace(/[]/g, "'");
      const collapsed = replacedQuotes.replace(/\s+/g,' ');
      const noPunct = collapsed.replace(/['"()!?,.:;]+/g,'');
      const ascii = noPunct.normalize('NFKD').replace(/[^\w\s-]/g,'').trim();
      const slug = ascii.toLowerCase().replace(/\s+/g,'-');
      [trimmed, replacedQuotes, collapsed, noPunct, ascii, slug].forEach(v=>{ if(v && v.length>=2) variants.add(v); });
      return Array.from(variants);
    };

    const fetchJSON = async (url: string) => {
      const res = await fetch(url);
      if(!res.ok) throw new Error(res.status+':'+url);
      return res.json();
    };

    const load = async () => {
      const nameVariants = genNameVariants(decoded);
      const detailUrls: string[] = [];
      nameVariants.forEach(v=>{
        detailUrls.push(`${API_BASE}/${encodeURIComponent(v)}`);
        if(v !== decodeURIComponent(v)) detailUrls.push(`${API_BASE}/${v}`); // raw variant
      });
      const chapterUrlCandidates = [
        ...nameVariants.flatMap(v=>[
          `${API_BASE}/${encodeURIComponent(v)}/chapters?order=esc`,
          `${API_BASE}/${encodeURIComponent(v)}/chapters?order=asc`,
          `${API_BASE}/${encodeURIComponent(v)}/chapters?order=desc`,
          `${API_BASE}/${encodeURIComponent(v)}/chapters`
        ])
      ];
      // Parallel fetch
  let detailData: MangaDetails | null = null;
  let chapterData: Chapter[] | null = null;
  let lastDetailErr: unknown = null;
  let lastChapterErr: unknown = null;
      await Promise.all([
        (async () => {
          for(const u of detailUrls){
            try { detailData = await fetchJSON(u); break; } catch(e){ lastDetailErr = e; }
          }
        })(),
        (async () => {
          for(const cu of chapterUrlCandidates){
            try { const data = await fetchJSON(cu); if(Array.isArray(data)){ chapterData = data; break; } } catch(e){ lastChapterErr = e; }
          }
        })()
      ]);
      if(!detailData) throw new Error('DETAIL_FETCH_FAILED:'+ lastDetailErr);
      if(!chapterData) {
        console.warn('[DetailsPage] All chapter endpoints failed', {lastChapterErr});
        chapterData = [];
      }
      // Normalize chapters ascending
  const mapped = chapterData.map((c:Chapter, idx:number)=>{
        if(c && (c.chapternum || c.chapterdate)) {
          const rawLabel = c.chapternum || c.chapter || c.chapter_number || '';
          const numMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(String(rawLabel));
          const parsedNum = numMatch ? numMatch[1] : (c.chapter_number ?? idx+1);
          return {
            chapter_number: parsedNum,
            title: c.title,
            link: c.link,
            date: c.chapterdate || c.date,
            rawLabel,
          } as Chapter;
        }
        return {
          chapter_number: c.chapter_number ?? c.chapternum ?? (idx+1),
          title: c.title,
          link: c.link,
          date: c.chapterdate || c.date,
          rawLabel: c.chapternum || c.chapter_number
        } as Chapter;
      });
      let ch = mapped.slice().sort((a:Chapter,b:Chapter)=>{
        const an = parseFloat(String(a.chapter_number)); const bn = parseFloat(String(b.chapter_number));
        if(isNaN(an) || isNaN(bn)) return 0; return an - bn;
      });
      const seen = new Set<string>();
      ch = ch.filter(item => { const key = String(item.chapter_number); if(seen.has(key)) return false; seen.add(key); return true; });
      if(active){
        setDetails(detailData);
        setChapters(ch);
      }
    };

    load().catch(err => {
      if(!active) return;
      console.error('[DetailsPage] Failed to load', err);
      let msg = 'Failed to load details';
      if(typeof err?.message === 'string'){
        if(err.message.includes('404')) msg = 'Not found';
        else if(err.message.includes('Failed to fetch')) msg = 'Network error';
      }
      setError(msg);
    }).finally(()=> { if(active) setLoading(false); });

    return ()=> { active=false; };
  }, [decoded]);

  useEffect(()=>{ if(decoded) { document.title = `${decoded} | ManhwaGalaxy`; } }, [decoded]);

  // Bookmark (local only)
  useEffect(()=>{
    if(!decoded) return;
    try { setBookmarked(localStorage.getItem('bookmark:'+decoded)==='1'); } catch(e){}
  },[decoded]);
  const toggleBookmark = () => {
    setBookmarked(b => {
      const next = !b;
      try {
        if(next) localStorage.setItem('bookmark:'+decoded,'1'); else localStorage.removeItem('bookmark:'+decoded);
      } catch(e){}
      return next;
    });
  };

  const truncatedDescription = useMemo(()=>{
    if(!details?.description) return '';
    const d = details.description.trim();
    if(d.length <= 320) return d;
    return descExpanded ? d : d.slice(0, 320).trimEnd() + '…';
  }, [details?.description, descExpanded]);

  // Ensure page within bounds when chapters change
  useEffect(()=>{
    const totalPages = Math.max(1, Math.ceil(chapters.length / pageSize));
    if(page > totalPages) setPage(totalPages);
  }, [chapters, page, pageSize]);

  const descendingChapters = useMemo(()=> [...chapters].reverse(), [chapters]);
  const totalPages = Math.max(1, Math.ceil(descendingChapters.length / pageSize));
  const pageChapters = useMemo(()=>{
    const start = (page - 1) * pageSize;
    return descendingChapters.slice(start, start + pageSize);
  }, [descendingChapters, page, pageSize]);

  const goToPage = (p:number) => {
    if(p < 1 || p > totalPages) return; setPage(p);
  };

  const renderPagination = () => {
    if(totalPages <= 1) return null;
    const maxButtons = 5; // center current
    let start = Math.max(1, page - Math.floor(maxButtons/2));
    let end = start + maxButtons - 1;
    if(end > totalPages) { end = totalPages; start = Math.max(1, end - maxButtons + 1); }
    const buttons = [];
    for(let i=start;i<=end;i++) {
      buttons.push(
        <button key={i} onClick={()=>goToPage(i)} className={`px-3 h-8 rounded-md border text-xs font-medium transition ${i===page ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>{i}</button>
      );
    }
    return (
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <button onClick={()=>goToPage(1)} disabled={page===1} className="px-2 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs disabled:opacity-40 hover:border-[var(--color-accent)]">« First</button>
        <button onClick={()=>goToPage(page-1)} disabled={page===1} className="px-2 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs disabled:opacity-40 hover:border-[var(--color-accent)]">‹ Prev</button>
        {buttons}
        <button onClick={()=>goToPage(page+1)} disabled={page===totalPages} className="px-2 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs disabled:opacity-40 hover:border-[var(--color-accent)]">Next ›</button>
        <button onClick={()=>goToPage(totalPages)} disabled={page===totalPages} className="px-2 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-xs disabled:opacity-40 hover:border-[var(--color-accent)]">Last »</button>
        <span className="text-[10px] text-[var(--color-text-dim)] ml-1">Page {page} / {totalPages}</span>
      </div>
    );
  };

  return (
    <main className="container-page max-w-5xl mx-auto py-6">
      <nav className="text-xs mb-4 text-[var(--color-text-dim)] flex gap-1">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="truncate max-w-[320px]" title={decoded}>{decoded}</span>
      </nav>
      {!loading && error ? (
        <div className="mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex flex-col items-center">
          <span className="font-semibold text-base mb-2">Oops! Something went wrong.</span>
          <span className="mb-3">{error}</span>
          <button
            onClick={() => { setError(null); setLoading(true); setPage(1); }}
            className="px-4 py-2 rounded bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition"
          >Retry</button>
        </div>
      ) : null}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">{decoded}</h1>
      {loading && (
        <div className="grid md:grid-cols-[220px_1fr] gap-8 mb-10">
          <div className="w-56 aspect-[3/4.3] rounded-lg border border-[var(--color-border)] shimmer" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded bg-[var(--color-border)]" />
            <div className="h-3 w-full rounded bg-[var(--color-border)]" />
            <div className="h-3 w-5/6 rounded bg-[var(--color-border)]" />
            <div className="h-3 w-4/6 rounded bg-[var(--color-border)]" />
          </div>
        </div>
      )}
      {!loading && details && (() => {
        const ratingNum = parseFloat(details.rating ?? "") || 0;
        const ratingPct = Math.max(0, Math.min(100, (ratingNum/10)*100));
        const firstChapter = chapters.length > 0 ? chapters[0] : null;
        const latestChapter = chapters.length > 0 ? chapters[chapters.length-1] : null;
        return (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/70 p-6 flex flex-col gap-8 mb-10 backdrop-blur-sm relative">
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-transparent [mask-image:linear-gradient(to_bottom,black,rgba(0,0,0,.6))]" />
            <div className="flex flex-col md:flex-row md:items-start gap-10">
              {/* Left column */}
              <div className="w-full md:w-60 flex flex-col gap-4 md:sticky md:top-20">
                {details.cover_image && (
                  <React.Suspense fallback={<div className="w-56 aspect-[3/4.3] rounded-lg border border-[var(--color-border)] shimmer" />}>
                    <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <Image src={details.cover_image || "/default.jpg"} alt={details.name} className="w-full h-auto object-cover" width={220} height={320} />
                      {details.colored && <span className="absolute top-2 left-2 text-[10px] bg-[var(--color-accent)] text-white font-semibold px-2 py-1 rounded-md flex items-center gap-1"><span>Color</span></span>}
                    </div>
                  </React.Suspense>
                )}
                <button type="button" onClick={toggleBookmark} className={`px-3 py-2 rounded-md bg-[var(--color-surface)] border text-xs font-medium transition flex items-center gap-2 justify-center ${bookmarked ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}> 
                  <span className="inline-block">{bookmarked ? '✅' : '🔖'}</span>{bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                {details.followers && (
                  <div className="text-[11px] text-[var(--color-text-dim)]">Followed by <span className="font-semibold text-[var(--color-text)]">{details.followers}</span> people</div>
                )}
                {details.rating && (
                  <div className="space-y-2 select-none">
                    <div className="h-3 rounded bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-hover))]" style={{width: ratingPct + '%'}} />
                    </div>
                    <div className="text-sm font-semibold flex items-center gap-1"><span>⭐</span>{details.rating}</div>
                  </div>
                )}
                {(firstChapter || latestChapter) && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {firstChapter && (
                      <a href={`/details/${encodeURIComponent(decoded)}/chapters/${firstChapter.chapter_number}`} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 flex flex-col hover:border-[var(--color-accent)] transition">
                        <span className="text-[var(--color-text-dim)]">First:</span>
                        <span className="font-semibold text-[var(--color-text)] truncate">Chapter {firstChapter.chapter_number}</span>
                        {firstChapter.date && <span className="text-[10px] text-[var(--color-text-dim)] mt-1">{firstChapter.date}</span>}
                      </a>
                    )}
                    {latestChapter && (
                      <a href={`/details/${encodeURIComponent(decoded)}/chapters/${latestChapter.chapter_number}`} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 flex flex-col hover:border-[var(--color-accent)] transition">
                        <span className="text-[var(--color-text-dim)]">Latest:</span>
                        <span className="font-semibold text-[var(--color-text)] truncate">Chapter {latestChapter.chapter_number}</span>
                        {latestChapter.date && <span className="text-[10px] text-[var(--color-text-dim)] mt-1">{latestChapter.date}</span>}
                      </a>
                    )}
                  </div>
                )}
              </div>
              {/* Right column */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-3 mb-4 text-xs">
                  {details.last_chapter && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-emerald-300 font-medium">{details.last_chapter}</span>}
                  {details.posted_on && <span className="px-2.5 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-dim)]">{details.posted_on}</span>}
                </div>
                <table className="w-full text-[11px] md:text-[12px] mb-5 border-separate border-spacing-y-1">
                  <tbody className="align-top">
                    {details.alternative && details.alternative !== details.name && (
                      <tr><td className="pr-4 text-[var(--color-text-dim)] whitespace-nowrap">Alternative</td><td className="text-[var(--color-text)] font-medium break-words">{details.alternative}</td></tr>
                    )}
                    {details.status && <tr><td className="pr-4 text-[var(--color-text-dim)]">Status</td><td className="text-[var(--color-text)]">{details.status || '-'}</td></tr>}
                    {details.type && <tr><td className="pr-4 text-[var(--color-text-dim)]">Type</td><td className="text-[var(--color-text)]">{details.type}</td></tr>}
                    {details.released && <tr><td className="pr-4 text-[var(--color-text-dim)]">Released</td><td className="text-[var(--color-text)]">{details.released}</td></tr>}
                    {details.author && <tr><td className="pr-4 text-[var(--color-text-dim)]">Author</td><td className="text-[var(--color-text)]">{details.author}</td></tr>}
                    {details.artist && <tr><td className="pr-4 text-[var(--color-text-dim)]">Artist</td><td className="text-[var(--color-text)]">{details.artist}</td></tr>}
                    {details.posted_by && <tr><td className="pr-4 text-[var(--color-text-dim)]">Posted By</td><td className="text-[var(--color-text)]">{details.posted_by}</td></tr>}
                    {details.posted_on && <tr><td className="pr-4 text-[var(--color-text-dim)]">Posted On</td><td className="text-[var(--color-text)]">{details.posted_on}</td></tr>}
                    {details.updated_on && <tr><td className="pr-4 text-[var(--color-text-dim)]">Updated On</td><td className="text-[var(--color-text)]">{details.updated_on}</td></tr>}
                    {details.views && <tr><td className="pr-4 text-[var(--color-text-dim)]">Views</td><td className="text-[var(--color-text)]">{details.views}</td></tr>}
                  </tbody>
                </table>
                {Array.isArray(details.genres) && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {details.genres.map((g: string) => (
                      <Link key={g} href={`/category/${encodeURIComponent(g)}`} className="pill-cat !text-[10px] !py-1 !px-3">{g}</Link>
                    ))}
                  </div>
                )}
                {details.description && (
                  <div className="text-sm leading-relaxed text-[var(--color-text-dim)] whitespace-pre-line max-w-prose">
                    {truncatedDescription}
                    {details.description.length > 320 && (
                      <button type="button" onClick={()=>setDescExpanded(e=>!e)} className="ml-2 text-[var(--color-accent)] hover:underline text-xs align-baseline">
                        {descExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {!loading && chapters.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3 gap-4">
            <h2 className="text-lg font-semibold">Chapters <span className="text-[var(--color-text-dim)] font-normal">({chapters.length})</span></h2>
            {renderPagination()}
          </div>
         <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {pageChapters.map((ch: Chapter, idx: number) => (
              <Link
                key={ch.chapter_number}
                href={`/details/${encodeURIComponent(decoded)}/chapters/${ch.chapter_number}`}
                className="h-10 px-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs flex items-center justify-between hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition group relative"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium group-hover:text-white">Chapter {ch.chapter_number}</span>
                  {ch.date && <span className="text-[10px] text-[var(--color-text-dim)] ml-3 whitespace-nowrap">{ch.date}</span>}
                </div>
                {ch.title && <span className="text-[var(--color-text-dim)] truncate max-w-full">{ch.title}</span>}
              </Link>
            ))}
          </div>
          {renderPagination()}
        </div>
      )}
    </main>
  );
}
