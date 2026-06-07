import { useEffect, useRef } from 'react';

interface UseLoadMoreOnIntersectParams {
  enabled?: boolean;
  fetchNextPage: () => void | Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

export function useLoadMoreOnIntersect({
  enabled = true,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: UseLoadMoreOnIntersectParams) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Cursor pagination stays lazy. Filters can make the table empty while the
  // sentinel is visible, so auto-loading is disabled during filtered views.
  useEffect(() => {
    if (!enabled) return;

    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return loadMoreRef;
}
