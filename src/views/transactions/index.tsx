'use client';

import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUp, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsIsoDate, parseAsString, useQueryStates } from 'nuqs';
import { useForm } from 'react-hook-form';

import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { DataTableSkeleton } from '@/components/skeletons/data-table-skeleton';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

import { downloadTransactions } from '@/utils/excel-download';
import { formatTransactionDate } from '@/utils/transactions';

import {
  useGetTransactions,
  useLoadMoreOnIntersect,
  useTransactionListSync,
} from '@/hooks/transactions';
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
  const [queryFilters, setQueryFilters] = useQueryStates({
    from: parseAsIsoDate,
    search: parseAsString,
    status: parseAsString,
    to: parseAsIsoDate,
  });
  const defaultFilters = useMemo<TransactionFilters>(
    () => ({
      interval:
        queryFilters.from || queryFilters.to
          ? {
              from: queryFilters.from ?? undefined,
              to: queryFilters.to ?? undefined,
            }
          : undefined,
      search: queryFilters.search ?? '',
      ...buildStatusDefaults(queryFilters.status),
    }),
    [
      queryFilters.from,
      queryFilters.search,
      queryFilters.status,
      queryFilters.to,
    ],
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
  const firstPageRows = useMemo(
    () => data?.pages[0]?.data ?? [],
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
    const status =
      values.all || selected.length === TRANSACTION_STATUSES.length
        ? null
        : selected.join(',');

    void setQueryFilters({
      from: values.interval?.from ?? null,
      search: values.search.trim() ? values.search.trim() : null,
      status,
      to: values.interval?.to ?? null,
    });
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
    void setQueryFilters({
      from: null,
      search: null,
      status: null,
      to: null,
    });
  };

  // Keep the visible filter form honest when the URL changes outside the form.
  // This covers shared links, reloads, and browser back/forward after filtering.
  useEffect(() => {
    form.reset(defaultFilters);
    setActiveFilters(defaultFilters);
  }, [defaultFilters, form]);

  const {
    handleShowNewRows,
    highlightedRowIds,
    listTopRef,
    pendingNewRowsCount,
    showNewRowsBanner,
  } = useTransactionListSync({
    environment,
    firstPageRows,
    isFetchingNextPage,
  });

  const loadMoreRef = useLoadMoreOnIntersect({
    enabled: !hasActiveFilters,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

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

      <div ref={listTopRef} className="scroll-mt-6" />

      {showNewRowsBanner && (
        <div className="sticky top-4 z-10 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleShowNewRows}
            className="shadow-md"
          >
            <ArrowUp className="size-4" />
            {t('newRows.banner', { count: pendingNewRowsCount })}
          </Button>
        </div>
      )}

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
            onClick={() => downloadTransactions(filteredData, t)}
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
          highlightedRowIds={highlightedRowIds}
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
