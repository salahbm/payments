'use client';

import { useMemo } from 'react';

import { Activity, CreditCard, ReceiptText, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { DataTableSkeleton } from '@/components/skeletons/data-table-skeleton';

import { formatTransactionAmount } from '@/utils/transactions';

import { useGetTransactions } from '@/hooks/transactions';
import { useEnvironmentStore } from '@/store/environment-store';

import {
  getAmountData,
  getCustomerData,
  getStatusData,
  getTransactionAmountValue,
} from './chart-utils';
import {
  AmountAreaChart,
  CustomerSpendingChart,
  StatusBarChart,
} from './charts';

const DASHBOARD_SAMPLE_SIZE = 100;

export default function DashboardView() {
  const t = useTranslations('dashboard');
  const transactionsT = useTranslations('transactions');
  const { environment } = useEnvironmentStore();
  const { data, isLoading, isFetching, dataUpdatedAt } = useGetTransactions({
    environment,
    limit: DASHBOARD_SAMPLE_SIZE,
  });

  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages],
  );
  const statusData = useMemo(() => getStatusData(transactions), [transactions]);
  const amountData = useMemo(() => getAmountData(transactions), [transactions]);
  const customerData = useMemo(
    () => getCustomerData(transactions),
    [transactions],
  );
  const totalAmount = useMemo(
    () =>
      transactions.reduce(
        (total, transaction) => total + getTransactionAmountValue(transaction),
        0,
      ),
    [transactions],
  );
  const customerCount = useMemo(
    () =>
      new Set(transactions.map((transaction) => transaction.customer.email))
        .size,
    [transactions],
  );
  const successCount =
    statusData.find((item) => item.status === 'succeeded')?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col-reverse items-start justify-between gap-2 lg:flex-row">
        <div className="flex flex-col gap-2">
          <h1 className="typo-header">{t('title')}</h1>
          <p className="typo-body-2 max-w-2xl text-muted-foreground">
            {t('description')}
          </p>
        </div>
        {/* <Breadcrumb items={[{ label: t('title') }]} /> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ReceiptText}
          label={t('metrics.transactions')}
          value={transactions.length.toLocaleString()}
        />
        <MetricCard
          icon={CreditCard}
          label={t('metrics.amount')}
          value={formatTransactionAmount(totalAmount * 100, 'usd')}
        />
        <MetricCard
          icon={Users}
          label={t('metrics.customers')}
          value={customerCount.toLocaleString()}
        />
        <MetricCard
          icon={Activity}
          label={t('metrics.succeeded')}
          value={successCount.toLocaleString()}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="typo-caption-1 text-muted-foreground">
          {t('sample', { count: transactions.length })}
        </p>
        <p className="typo-caption-1 text-muted-foreground">
          {isFetching
            ? transactionsT('sync.syncing')
            : transactionsT('sync.lastUpdated', {
                time: dataUpdatedAt
                  ? new Date(dataUpdatedAt).toLocaleTimeString()
                  : transactionsT('sync.never'),
              })}
        </p>
      </div>

      {isLoading ? (
        <DataTableSkeleton columnCount={3} rowCount={8} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <StatusBarChart data={statusData} statusT={transactionsT} t={t} />
          <AmountAreaChart data={amountData} t={t} />
          <div className="xl:col-span-2">
            <CustomerSpendingChart data={customerData} t={t} />
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="typo-caption-1 text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded bg-muted">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="typo-header mt-4">{value}</p>
    </section>
  );
}
