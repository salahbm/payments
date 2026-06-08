import { useCallback, useEffect, useRef, useState } from 'react';

import { Environment, TransactionListItem } from '@/types/transaction';

interface UseTransactionListSyncParams {
  environment: Environment;
  firstPageRows: TransactionListItem[];
  isFetchingNextPage: boolean;
}

export function useTransactionListSync({
  environment,
  firstPageRows,
  isFetchingNextPage,
}: UseTransactionListSyncParams) {
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const previousFirstPageIdsRef = useRef<Set<string> | null>(null);
  const highlightTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const [highlightedRowIds, setHighlightedRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingNewRowIds, setPendingNewRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isListTopVisible, setIsListTopVisible] = useState(true);

  // New-row highlights are deliberately temporary UI state. Timers live in a
  // ref so polling can refresh data without causing extra renders for bookkeeping.
  const clearHighlightTimers = useCallback(() => {
    for (const timeout of highlightTimeoutsRef.current.values()) {
      clearTimeout(timeout);
    }

    highlightTimeoutsRef.current.clear();
  }, []);

  // Environment switches mean a different transaction universe, so previous IDs
  // should not be compared against the new environment.
  useEffect(() => {
    previousFirstPageIdsRef.current = null;
    setHighlightedRowIds(new Set());
    setPendingNewRowIds(new Set());
    clearHighlightTimers();

    return clearHighlightTimers;
  }, [clearHighlightTimers, environment]);

  // The banner is only useful when the user is not already looking at the newest
  // rows. This marker sits above the table controls and tells us when that is true.
  useEffect(() => {
    const element = listTopRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = Boolean(entry?.isIntersecting);
        setIsListTopVisible(isVisible);

        if (isVisible) {
          setPendingNewRowIds(new Set());
        }
      },
      {
        rootMargin: '-16px 0px 0px 0px',
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Compare only the first page. Loading older cursor pages should not be treated
  // as "new transactions"; only rows newly prepended by the server should light up.
  useEffect(() => {
    if (!firstPageRows.length) return;

    const currentIds = new Set(
      firstPageRows.map((transaction) => transaction.id),
    );
    const previousIds = previousFirstPageIdsRef.current;

    previousFirstPageIdsRef.current = currentIds;

    if (!previousIds || isFetchingNextPage) return;

    const newIds = firstPageRows
      .map((transaction) => transaction.id)
      .filter((id) => !previousIds.has(id));

    if (!newIds.length) return;

    setHighlightedRowIds((current) => {
      const next = new Set(current);
      newIds.forEach((id) => next.add(id));
      return next;
    });

    if (!isListTopVisible) {
      setPendingNewRowIds((current) => {
        const next = new Set(current);
        newIds.forEach((id) => next.add(id));
        return next;
      });
    }

    newIds.forEach((id) => {
      const existingTimeout = highlightTimeoutsRef.current.get(id);

      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(() => {
        setHighlightedRowIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
        highlightTimeoutsRef.current.delete(id);
      }, 2_000);

      highlightTimeoutsRef.current.set(id, timeout);
    });
  }, [firstPageRows, isFetchingNextPage, isListTopVisible]);

  const handleShowNewRows = () => {
    listTopRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setPendingNewRowIds(new Set());
  };

  const pendingNewRowsCount = pendingNewRowIds.size;

  return {
    handleShowNewRows,
    highlightedRowIds,
    listTopRef,
    pendingNewRowsCount,
    showNewRowsBanner: pendingNewRowsCount > 0 && !isListTopVisible,
  };
}
