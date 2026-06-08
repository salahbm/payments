'use client';

import { useMemo } from 'react';

import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';

import '@/lib/ag-charts';

import { TransactionStatus } from '@/types/transaction';

import {
  AmountDatum,
  CustomerDatum,
  StatusDatum,
  statusOrder,
} from './chart-utils';

type Translate = (
  _key: string,
  _values?: Record<string, string | number>,
) => string;

const statusColor: Record<TransactionStatus, string> = {
  failed: '#ef4444',
  pending: '#f59e0b',
  refunded: '#06b6d4',
  succeeded: '#22c55e',
};

const chartColors = {
  amount: '#2563eb',
  axis: '#737373',
  grid: '#e5e7eb',
  spending: '#8b5cf6',
};

type StatusChartDatum = StatusDatum & {
  color: string;
  label: string;
};

const baseOptions = {
  background: {
    fill: 'transparent',
  },
  legend: {
    item: {
      label: {
        fontFamily: 'inherit',
      },
    },
  },
  padding: {
    bottom: 8,
    left: 0,
    right: 0,
    top: 8,
  },
  theme: {
    overrides: {
      common: {
        axes: {
          category: {
            label: {
              color: chartColors.axis,
              fontFamily: 'inherit',
            },
          },
          number: {
            label: {
              color: chartColors.axis,
              fontFamily: 'inherit',
            },
          },
        },
      },
    },
  },
} satisfies Partial<AgChartOptions>;

export function StatusBarChart({
  data,
  statusT,
  t,
}: {
  data: StatusDatum[];
  statusT: Translate;
  t: Translate;
}) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        color: statusColor[item.status],
        label: statusT(
          `status.${item.status}` as `status.${TransactionStatus}`,
        ),
      })),
    [data, statusT],
  );
  const options = useMemo<AgChartOptions>(
    () =>
      ({
        ...baseOptions,
        axes: [
          {
            position: 'left',
            type: 'category',
          },
          {
            position: 'bottom',
            type: 'number',
          },
        ],
        data: chartData,
        height: 280,
        series: [
          {
            direction: 'horizontal',
            itemStyler: ({ datum }: { datum: StatusChartDatum }) => ({
              fill: datum.color,
            }),
            label: {
              enabled: true,
            },
            type: 'bar',
            xKey: 'label',
            yKey: 'count',
            yName: t('charts.status.count'),
          },
        ],
      }) as unknown as AgChartOptions,
    [chartData, t],
  );

  return (
    <ChartShell
      title={t('charts.status.title')}
      subtitle={t('charts.status.subtitle')}
    >
      {chartData.length ? <AgCharts options={options} /> : <EmptyChart t={t} />}
    </ChartShell>
  );
}

export function AmountAreaChart({
  data,
  t,
}: {
  data: AmountDatum[];
  t: Translate;
}) {
  const options = useMemo<AgChartOptions>(
    () =>
      ({
        ...baseOptions,
        axes: [
          {
            position: 'bottom',
            type: 'category',
          },
          {
            position: 'left',
            type: 'number',
          },
        ],
        data,
        height: 280,
        series: [
          {
            fill: chartColors.amount,
            fillOpacity: 0.2,
            marker: {
              enabled: true,
              fill: chartColors.amount,
              stroke: chartColors.amount,
            },
            stroke: chartColors.amount,
            strokeWidth: 3,
            type: 'area',
            xKey: 'hour',
            yKey: 'amount',
            yName: t('charts.amount.amount'),
          },
        ],
      }) as unknown as AgChartOptions,
    [data, t],
  );

  return (
    <ChartShell
      title={t('charts.amount.title')}
      subtitle={t('charts.amount.subtitle')}
    >
      {data.length ? <AgCharts options={options} /> : <EmptyChart t={t} />}
    </ChartShell>
  );
}

export function CustomerSpendingChart({
  data,
  t,
}: {
  data: CustomerDatum[];
  t: Translate;
}) {
  const chartData = useMemo(
    () =>
      data.map((customer) => ({
        failedRate: customer.statusRates.failed,
        name: customer.name,
        pendingRate: customer.statusRates.pending,
        refundedRate: customer.statusRates.refunded,
        spending: customer.amount,
        succeededRate: customer.statusRates.succeeded,
      })),
    [data],
  );
  const options = useMemo<AgChartOptions>(
    () =>
      ({
        ...baseOptions,
        axes: [
          {
            position: 'bottom',
            type: 'category',
          },
          {
            position: 'left',
            type: 'number',
          },
          {
            keys: statusOrder.map((status) => `${status}Rate`),
            label: {
              formatter: ({ value }: { value: number }) => `${value}%`,
            },
            position: 'right',
            type: 'number',
          },
        ],
        data: chartData,
        height: 340,
        legend: {
          enabled: true,
        },
        series: [
          {
            fill: chartColors.spending,
            type: 'bar',
            xKey: 'name',
            yKey: 'spending',
            yName: t('charts.customers.spending'),
          },
          ...statusOrder.map((status) => ({
            marker: {
              enabled: true,
              fill: statusColor[status],
              stroke: statusColor[status],
            },
            stroke: statusColor[status],
            strokeWidth: 2,
            type: 'line' as const,
            xKey: 'name',
            yKey: `${status}Rate`,
            yName: t(`charts.customers.${status}`),
          })),
        ],
      }) as unknown as AgChartOptions,
    [chartData, t],
  );

  return (
    <ChartShell
      title={t('charts.customers.title')}
      subtitle={t('charts.customers.subtitle')}
    >
      {chartData.length ? <AgCharts options={options} /> : <EmptyChart t={t} />}
    </ChartShell>
  );
}

function ChartShell({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded border bg-background p-4 md:p-5">
      <div className="mb-5">
        <h2 className="typo-body-1">{title}</h2>
        <p className="typo-body-2 mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ t }: { t: Translate }) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded border border-dashed">
      <p className="typo-body-2 text-muted-foreground">{t('charts.empty')}</p>
    </div>
  );
}
