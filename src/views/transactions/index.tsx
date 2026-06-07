'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';

import { DataTable } from '@/components/shared/data-table';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';

import { useDataTable } from '@/hooks/common/use-data-table';
import { useDebounce } from '@/hooks/common/use-debounce';
import { useQueryReader } from '@/hooks/common/use-query-reader';
import { useGetTransactions } from '@/hooks/transactions';
import { useEnvironmentStore } from '@/store/environment-store';

import { getTransactionColumns } from './columns';

export default function TransactionsView() {
  const t = useTranslations('transactions');
  const { environment } = useEnvironmentStore();
  const [search, setSearch] = useQueryState('search');
  const debouncedSearch = useDebounce(setSearch);
  const query = useQueryReader({
    page: { type: 'number', defaultValue: 1 },
    search: { type: 'string', defaultValue: '' },
    size: { type: 'number', defaultValue: 20 },
    sort: { type: 'object', defaultValue: [{ id: 'created_at', desc: true }] },
  });

  const { data, isFetching, isLoading, dataUpdatedAt } = useGetTransactions({
    environment,
    limit: query.size,
  });

  const filteredData = useMemo(() => {
    const rows = data?.data ?? [];
    const normalizedSearch = query.search.trim().toLowerCase();

    if (!normalizedSearch) return rows;

    return rows.filter((transaction) =>
      [
        transaction.id,
        transaction.currency,
        transaction.status,
        transaction.customer.name,
        transaction.customer.email,
      ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [data?.data, query.search]);

  const columns = useMemo(() => getTransactionColumns(t), [t]);

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: 1,
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    meta: {
      includePaginationReset: true,
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: t('title') }]} />

      <div className="flex flex-col gap-2">
        <h1 className="typo-header">{t('title')}</h1>
        <p className="typo-body-2 max-w-2xl text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded border bg-background p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={search ?? ''}
            type="search"
            placeholder={t('searchPlaceholder')}
            onChange={(event) => debouncedSearch(event.target.value)}
            className="lg:max-w-sm"
          />
          <div className="typo-caption-1 text-muted-foreground">
            {isFetching
              ? t('sync.syncing')
              : t('sync.lastUpdated', {
                  time: dataUpdatedAt
                    ? new Date(dataUpdatedAt).toLocaleTimeString()
                    : t('sync.never'),
                })}
          </div>
        </div>
        <DataTable table={table} isLoading={isFetching && !data} />
      </div>
    </div>
  );
}
