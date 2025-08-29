"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MangaCardRef.module.css';

export interface RefChapter { number: number | string; url: string; time?: string; }
export interface MangaCardRefProps {
  title: string;
  imageUrl: string;
  mangaUrl: string;
  rating?: number | string;
  lastChapter?: number | string;
  postedOn?: string; // ISO date or readable string
  chapters?: RefChapter[];
  typeLabel?: string;
  colored?: boolean;
  hot?: boolean;
  index?: number;
  // Controls how the chapter label is displayed: 'full' => "Chapter 12", 'number' => "12"
  chapterLabelStyle?: 'full' | 'number';
}

const MangaCardRef: React.FC<MangaCardRefProps> = ({
  title,
  imageUrl,
  mangaUrl,
  rating,
  lastChapter,
  postedOn,
  chapters = [],
  typeLabel,
  colored = false,
  hot = false,
  index,
  chapterLabelStyle = 'full',
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);


    // Build chapter URL from the details page URL
  // Use hyphens for readable URLs
  const slugify = (str: string) => str.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const detailsBase = `/details/${slugify(title)}`;
 const makeChapterUrl = (num: number | string) => {
   const cleanNum = String(num).replace(/^Chapter\s*/i, '').replace(/\s+/g, '');
   return `${detailsBase}/chapters/${encodeURIComponent(cleanNum)}`;
 };


    const displayChapters =
    chapters.length > 0
      ? chapters.slice(0, 2) // keep original numbers/times
      : lastChapter != null
      // fallback chip for lastChapter that links to chapter page instead of details hash
      ? [{ number: lastChapter, url: makeChapterUrl(lastChapter) }]
      : [];  
      
      
      
      const formatChapterLabel = (raw: number | string) => {
    const s = String(raw).trim();
    if (chapterLabelStyle === 'number') {
      const m = s.match(/([0-9]+(?:\.[0-9]+)?)/);
      return m ? m[1] : s.replace(/^chapter\s*/i, '').replace(/^ch\.?\s*/i, '').trim();
    }
    // If already starts with 'chapter' keep it as single instance (normalize capitalization)
    if (/^chapter\b/i.test(s)) {
      // Capitalize first letter only
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    // Normalize shorthand like Ch. / ch / ch.42
    if (/^ch\.?\s*/i.test(s)) {
      return 'Chapter ' + s.replace(/^ch\.?\s*/i,'');
    }
    return 'Chapter ' + s;
  };
  return (
    <>
     
      <div className={styles.bsx}>
        <div className={styles.bs}>
          <Link href={mangaUrl} className={styles.limit} title={title}>
            {!imgLoaded && <div className={styles.skeleton} />}
            <Image
              src={imageUrl || "/default.jpg"}
              alt={`${title} - ManhwaGalaxy (Manga Galaxy)`}
              width={180}
              height={240}
              onLoad={() => setImgLoaded(true)}
              className={styles.coverImg}
              priority={typeof index === 'number' && index < 8}
            />
            <div className={styles.ply}>
              {rating !== undefined && <span className={styles.rating}>⭐ {rating}</span>}
              {typeLabel && <span className={styles.type}>{typeLabel}</span>}
              {colored && <span className={styles.col}>COLORED</span>}
              {hot && <span className={styles.hot}>HOT</span>}
            </div>
          </Link>
          <div className={styles.bigor}>
            {/* Make title text smaller */}
            <style jsx>{`
              .${styles.tt} {
                font-size: 1rem !important;
              }
            `}</style>
            <Link href={mangaUrl} className={styles.tt} title={title}>{title}</Link>
            {displayChapters.length > 0 && (
              <div className={styles.chfiv}>
                {displayChapters.map((ch, i) => (
                  <Link
                    key={i}
                    href={makeChapterUrl(ch.number)} // force chapter page URL
                    className={styles.ephiv}
                    title={formatChapterLabel(ch.number)}
                  >
                    <span className={styles.fivchap}>{formatChapterLabel(ch.number)}</span>
                    <span className={styles.metaWrap}>
                      {postedOn && i === 0 && <span className={styles.fivtime}>{postedOn}</span>}
                      {ch.time && <span className={styles.fivtime}>{ch.time}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MangaCardRef;
