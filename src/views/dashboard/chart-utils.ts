import { format } from 'date-fns';

import { formatTransactionDate } from '@/utils/transactions';

import { TransactionListItem, TransactionStatus } from '@/types/transaction';

export const statusOrder: TransactionStatus[] = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
];

export type StatusDatum = {
  count: number;
  status: TransactionStatus;
};

export type AmountDatum = {
  amount: number;
  hour: string;
};

export type CustomerDatum = {
  amount: number;
  email: string;
  name: string;
  statusRates: Record<TransactionStatus, number>;
  statuses: Record<TransactionStatus, number>;
  transactionCount: number;
};

export const getTransactionAmountValue = (transaction: TransactionListItem) => {
  const divisor = ['jpy', 'krw'].includes(transaction.currency.toLowerCase())
    ? 1
    : 100;

  return transaction.amount / divisor;
};

export const getStatusData = (
  transactions: TransactionListItem[],
): StatusDatum[] =>
  statusOrder.map((status) => ({
    count: transactions.filter((transaction) => transaction.status === status)
      .length,
    status,
  }));

export const getAmountData = (
  transactions: TransactionListItem[],
): AmountDatum[] => {
  const totals = new Map<string, number>();

  transactions.forEach((transaction) => {
    const hour = format(formatTransactionDate(transaction.created_at), 'mm:00');
    const current = totals.get(hour) ?? 0;

    totals.set(hour, current + getTransactionAmountValue(transaction));
  });

  return Array.from(totals.entries())
    .map(([hour, amount]) => ({ amount, hour }))
    .slice(-10);
};

export const getCustomerData = (
  transactions: TransactionListItem[],
): CustomerDatum[] => {
  const customers = new Map<string, CustomerDatum>();

  transactions.forEach((transaction) => {
    const key = transaction.customer.email;
    const customer = customers.get(key) ?? {
      amount: 0,
      email: transaction.customer.email,
      name: transaction.customer.name,
      statuses: {
        failed: 0,
        pending: 0,
        refunded: 0,
        succeeded: 0,
      },
      statusRates: {
        failed: 0,
        pending: 0,
        refunded: 0,
        succeeded: 0,
      },
      transactionCount: 0,
    };

    customer.amount += getTransactionAmountValue(transaction);
    customer.statuses[transaction.status] += 1;
    customer.transactionCount += 1;
    customers.set(key, customer);
  });

  return Array.from(customers.values())
    .map((customer) => ({
      ...customer,
      statusRates: {
        failed: (customer.statuses.failed / customer.transactionCount) * 100,
        pending: (customer.statuses.pending / customer.transactionCount) * 100,
        refunded:
          (customer.statuses.refunded / customer.transactionCount) * 100,
        succeeded:
          (customer.statuses.succeeded / customer.transactionCount) * 100,
      },
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
};
