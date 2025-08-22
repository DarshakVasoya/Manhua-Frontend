import React from "react";
import MangaCardRef from "./MangaCardRef";

const BASE = "http://165.232.60.4:8000";

const normalizeUrl = (u: string) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE}${u.startsWith("/") ? u : `/${u}`}`;
};

const titleOf = (it: any) => it?.title || it?.name || it?.manga_title || it?.mangaName || "";
const coverOf = (it: any) => normalizeUrl(it?.cover_image || it?.image_url || it?.cover || it?.thumbnail || it?.image || "");
const latestChapterOf = (it: any) => it?.latestChapter || it?.last_chapter || it?.chapter;
const postedOnOf = (it: any) => it?.updated_at || it?.posted_on || it?.date || it?.time;

export default function MangaGrid({ items }: { items: any[] }) {
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
            postedOn={postedOn}
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