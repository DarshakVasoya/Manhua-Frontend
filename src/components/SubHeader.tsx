import React from "react";
import { usePathname } from "next/navigation";

export interface SubHeaderProps {
  tags?: string[];
  className?: string;
}

const DEFAULT_TAGS = [
  "Latest",
  "Adult",
  "Action",
  "Romance",
  "Fantasy",
  "Isekai",
  "Comedy",
  "Adventure",
  "Drama",
  "Supernatural"
];

export default function SubHeader({ tags = DEFAULT_TAGS, className = "" }: SubHeaderProps) {
  const pathname = usePathname();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('.pill-cat.active');
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [pathname, tags]);

  return (
    <div ref={containerRef} className={`flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent px-1 py-2 ${className}`} style={{ WebkitOverflowScrolling: "touch" }}>
      {tags.map((tag) => {
        const href = tag === "Latest" ? "/" : `/category/${encodeURIComponent(tag)}`;
        const active = pathname === href || (pathname === "/" && tag === "Latest");
        return (
          <a key={tag} href={href} className={`pill-cat${active ? " active" : ""}`}>{tag}</a>
        );
      })}
    </div>
  );
}
