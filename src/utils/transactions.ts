import { TransactionStatus } from '@/types/transaction';

const zeroDecimalCurrencies = new Set(['jpy', 'krw']);

export const formatTransactionAmount = (
  amount: number,
  currency: string,
): string => {
  const normalizedCurrency = currency.toUpperCase();
  const divisor = zeroDecimalCurrencies.has(currency.toLowerCase()) ? 1 : 100;

  return new Intl.NumberFormat('en', {
    currency: normalizedCurrency,
    style: 'currency',
  }).format(amount / divisor);
};

export const statusVariantClassName: Record<TransactionStatus, string> = {
  failed:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
  pending:
    'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300',
  succeeded:
    'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300',
  refunded:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
};

export const formatTransactionDate = (value: string): Date => new Date(value);
