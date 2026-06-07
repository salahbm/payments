import { useEffect, useRef } from 'react';

interface UseLoadMoreOnIntersectParams {
  fetchNextPage: () => void | Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

export function useLoadMoreOnIntersect({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: UseLoadMoreOnIntersectParams) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Cursor pagination stays lazy: we fetch the next page only when the user
  // reaches the bottom sentinel, not immediately after the first page loads.
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return loadMoreRef;
}
