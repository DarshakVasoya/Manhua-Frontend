import React from "react";
import MangaCardRef from "./MangaCardRef";

const BASE = "https://api.manhwagalaxy.org";

const normalizeUrl = (u: string) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE}${u.startsWith("/") ? u : `/${u}`}`;
};

interface MangaItem {
  name?: string;
  cover_image?: string;
  rating?: number;
  last_chapter?: string;
  posted_on?: string;
  updated_at?: string;
  genres?: string[];
  genre?: string;
  image?: string;
  title?: string;
  manga_title?: string;
  mangaName?: string;
  image_url?: string;
  cover?: string;
  thumbnail?: string;
  latestChapter?: string;
  chapter?: string;
  score?: number;
  type?: string;
  format?: string;
  colored?: boolean;
  hot?: boolean;
  trending?: boolean;
  [key: string]: unknown;
}
const titleOf = (it: MangaItem) => it?.title || it?.name || it?.manga_title || it?.mangaName || "";
const coverOf = (it: MangaItem) => normalizeUrl(it?.cover_image || it?.image_url || it?.cover || it?.thumbnail || it?.image || "");
const latestChapterOf = (it: MangaItem) => it?.latestChapter || it?.last_chapter || it?.chapter;
const postedOnOf = (it: MangaItem) => it?.updated_at || it?.posted_on || it?.date || it?.time;

export default function MangaGrid({ items }: { items: MangaItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 fade-in">
      {items.map((it, i) => {
        const title = titleOf(it);
        const imageUrl = coverOf(it);
        const mangaUrl = `/details/${encodeURIComponent(title)}`;
        const lastChapter = latestChapterOf(it);
        const postedOn = postedOnOf(it);
        const rating = it?.rating ?? it?.score ?? undefined;
        const typeLabel = it?.type || it?.format || undefined;
        const colored = Boolean(it?.colored);
        const hot = Boolean(it?.hot || it?.trending);

        return (
          <MangaCardRef
            key={`${title}-${i}`}
            title={title || "Untitled"}
            imageUrl={imageUrl}
            mangaUrl={mangaUrl}
            rating={rating}
            lastChapter={lastChapter}
            postedOn={typeof postedOn === "string" ? postedOn : undefined}
            typeLabel={typeLabel}
            colored={colored}
            hot={hot}
            index={i}
          />
        );
      })}
    </div>
  );
}