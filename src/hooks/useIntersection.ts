import { RefObject, useEffect, useState } from 'react';

interface Options extends IntersectionObserverInit { freezeOnceVisible?: boolean }

export function useIntersection<T extends Element>(
  ref: RefObject<T>,
  { threshold = 0.1, root = null, rootMargin = '0px', freezeOnceVisible = false }: Options = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const isFrozen = freezeOnceVisible && entry?.isIntersecting;

  useEffect(() => {
    if (isFrozen) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([ent]) => setEntry(ent), { threshold, root, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold, root, rootMargin, isFrozen]);

  return entry;
}
