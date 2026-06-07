'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';

import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { DataTableSkeleton } from '@/components/skeletons/data-table-skeleton';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

import { downloadTransactions } from '@/utils/excel-download';
import { formatTransactionDate } from '@/utils/transactions';

import { useGetTransactions } from '@/hooks/transactions';
import { useEnvironmentStore } from '@/store/environment-store';

import { TransactionTable } from './transaction-table';
import {
  PAGE_SIZE,
  TRANSACTION_STATUSES,
  TransactionFilters,
  TransactionsTableActions,
  buildStatusDefaults,
  transactionFiltersSchema,
} from './transitions-table-actions';

export default function TransactionsView() {
  const t = useTranslations('transactions');
  const { environment } = useEnvironmentStore();
  const [search, setSearch] = useQueryState('search');
  const [statusParam, setStatusParam] = useQueryState('status');
  const [fromParam, setFromParam] = useQueryState('from');
  const [toParam, setToParam] = useQueryState('to');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const defaultFilters = useMemo<TransactionFilters>(
    () => ({
      interval:
        fromParam || toParam
          ? {
              from: fromParam ? new Date(fromParam) : undefined,
              to: toParam ? new Date(toParam) : undefined,
            }
          : undefined,
      search: search ?? '',
      ...buildStatusDefaults(statusParam),
    }),
    [fromParam, search, statusParam, toParam],
  );
  const [activeFilters, setActiveFilters] =
    useState<TransactionFilters>(defaultFilters);

  const form = useForm<TransactionFilters>({
    resolver: zodResolver(transactionFiltersSchema),
    defaultValues: defaultFilters,
  });

  const failed = activeFilters.failed;
  const pending = activeFilters.pending;
  const refunded = activeFilters.refunded;
  const succeeded = activeFilters.succeeded;

  const {
    data,
    dataUpdatedAt,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useGetTransactions({
    environment,
    limit: PAGE_SIZE,
  });

  const selectedStatuses = useMemo(
    () =>
      new Set(
        TRANSACTION_STATUSES.filter((status) => {
          const statusMap = {
            failed,
            pending,
            refunded,
            succeeded,
          };

          return statusMap[status];
        }),
      ),
    [failed, pending, refunded, succeeded],
  );
  const hasActiveFilters =
    Boolean(activeFilters.search.trim()) ||
    Boolean(activeFilters.interval?.from || activeFilters.interval?.to) ||
    selectedStatuses.size !== TRANSACTION_STATUSES.length;

  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages],
  );

  const filteredData = useMemo(() => {
    const normalizedSearch = activeFilters.search.trim().toLowerCase();
    const fromTime = activeFilters.interval?.from
      ? new Date(activeFilters.interval.from).setHours(0, 0, 0, 0)
      : null;
    const toTime = activeFilters.interval?.to
      ? new Date(activeFilters.interval.to).setHours(23, 59, 59, 999)
      : null;

    return rows.filter((transaction) => {
      const createdAt = formatTransactionDate(transaction.created_at).getTime();
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.id,
          transaction.currency,
          transaction.status,
          transaction.customer.name,
          transaction.customer.email,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesStatus = selectedStatuses.has(transaction.status);
      const matchesFrom = fromTime ? createdAt >= fromTime : true;
      const matchesTo = toTime ? createdAt <= toTime : true;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [
    activeFilters.interval?.from,
    activeFilters.interval?.to,
    activeFilters.search,
    rows,
    selectedStatuses,
  ]);

  const applyFiltersToUrl = (values: TransactionFilters) => {
    const selected = TRANSACTION_STATUSES.filter((status) => values[status]);
    const value =
      values.all || selected.length === TRANSACTION_STATUSES.length
        ? null
        : selected.join(',');

    void setSearch(values.search.trim() ? values.search.trim() : null);
    void setStatusParam(value);
    void setFromParam(
      values.interval?.from ? format(values.interval.from, 'yyyy-MM-dd') : null,
    );
    void setToParam(
      values.interval?.to ? format(values.interval.to, 'yyyy-MM-dd') : null,
    );
  };

  const handleConfirm = (values: TransactionFilters) => {
    setActiveFilters(values);
    applyFiltersToUrl(values);
  };

  const handleReset = () => {
    const values: TransactionFilters = {
      all: true,
      failed: true,
      interval: undefined,
      pending: true,
      refunded: true,
      search: '',
      succeeded: true,
    };

    form.reset(values);
    setActiveFilters(values);
    void setSearch(null);
    void setStatusParam(null);
    void setFromParam(null);
    void setToParam(null);
  };

  useEffect(() => {
    form.reset(defaultFilters);
    setActiveFilters(defaultFilters);
  }, [defaultFilters, form]);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (
        entry?.isIntersecting &&
        hasNextPage &&
        !hasActiveFilters &&
        !isFetchingNextPage
      ) {
        void fetchNextPage();
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasActiveFilters, hasNextPage, isFetchingNextPage]);

  const handleDownload = () => downloadTransactions(filteredData, t);

  return (
    <div className="relative flex flex-col gap-6">
      <div className="flex flex-col-reverse items-start justify-between gap-2 lg:flex-row">
        <div className="flex flex-col gap-2">
          <h1 className="typo-header">{t('title')}</h1>
          <p className="typo-body-2 max-w-2xl text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Breadcrumb items={[{ label: t('title') }]} />
      </div>

      <div className="flex flex-col gap-4 border-b bg-background pb-4 md:rounded lg:border lg:p-4">
        <TransactionsTableActions
          form={form}
          onConfirm={handleConfirm}
          onReset={handleReset}
          t={t}
        />
      </div>

      <div className="flex flex-col gap-4 border-b bg-background pb-4 md:rounded lg:border lg:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="typo-caption-1 text-foreground">
            {t('resultCount', {
              count: filteredData.length,
            })}
          </p>

          <div className="typo-caption-1 mr-4 ml-auto text-muted-foreground">
            {isFetching
              ? t('sync.syncing')
              : t('sync.lastUpdated', {
                  time: dataUpdatedAt
                    ? new Date(dataUpdatedAt).toLocaleTimeString()
                    : t('sync.never'),
                })}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!filteredData.length}
            className="max-w-40 px-4"
          >
            <Download className="size-4" />
            {t('actions.download')}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <DataTableSkeleton columnCount={6} rowCount={PAGE_SIZE} />
      ) : (
        <TransactionTable
          data={filteredData}
          emptyDescription={t(
            rows.length ? 'empty.filteredDescription' : 'empty.description',
          )}
          emptyTitle={t(rows.length ? 'empty.filteredTitle' : 'empty.title')}
          isLoading={isFetching && !data}
          t={t}
        />
      )}

      <div ref={loadMoreRef} className="flex min-h-12 justify-center">
        {isFetchingNextPage && (
          <DataTableSkeleton columnCount={6} rowCount={3} className="w-full" />
        )}
        {!isFetchingNextPage && hasNextPage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchNextPage()}
          >
            {t('actions.loadMore')}
          </Button>
        )}
        {!hasNextPage && rows.length > 0 && (
          <p className="typo-caption-1 text-muted-foreground">
            {t('endOfList')}
          </p>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}
