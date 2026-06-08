'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/components/shared/data-table/column-header';
import { TransactionStatusBadge } from '@/components/shared/transaction-status-badge';

import {
  formatTransactionAmount,
  formatTransactionDate,
} from '@/utils/transactions';

import { Link } from '@/i18n/routing';
import { TransactionListItem, TransactionStatus } from '@/types/transaction';

type Translate = (_key: string) => string;

export const getTransactionColumns = (
  t: Translate,
): ColumnDef<TransactionListItem>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.id')} />
    ),
    cell: ({ row }) => (
      <Link
        href={`/transactions/${row.original.id}`}
        className="font-mono text-primary hover:underline"
      >
        {row.original.id}
      </Link>
    ),
    meta: {
      label: t('table.id'),
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.amount')} />
    ),
    cell: ({ row }) =>
      formatTransactionAmount(row.original.amount, row.original.currency),
    meta: {
      label: t('table.amount'),
    },
  },
  {
    accessorKey: 'currency',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.currency')} />
    ),
    cell: ({ row }) => row.original.currency.toUpperCase(),
    meta: {
      label: t('table.currency'),
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.status')} />
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <TransactionStatusBadge
          status={status}
          label={t(`status.${status}` as `status.${TransactionStatus}`)}
        />
      );
    },
    meta: {
      label: t('table.status'),
    },
  },
  {
    accessorKey: 'customer.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.customer')} />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-48 flex-col">
        <span>{row.original.customer.name}</span>
        <span className="typo-caption-1 text-muted-foreground">
          {row.original.customer.email}
        </span>
      </div>
    ),
    meta: {
      label: t('table.customer'),
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('table.createdAt')} />
    ),
    cell: ({ row }) =>
      format(formatTransactionDate(row.original.created_at), 'PPP p'),
    meta: {
      label: t('table.createdAt'),
    },
  },
];
