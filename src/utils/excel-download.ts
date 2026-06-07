import { format } from 'date-fns';

import {
  formatTransactionAmount,
  formatTransactionDate,
} from '@/utils/transactions';

import { TransactionListItem, TransactionStatus } from '@/types/transaction';

type Translate = (
  _key: string,
  _values?: Record<string, string | number>,
) => string;

export function downloadTransactions(
  rows: TransactionListItem[],
  t: Translate,
) {
  const headers = [
    t('table.id'),
    t('table.amount'),
    t('table.currency'),
    t('table.status'),
    t('table.customer'),
    t('table.email'),
    t('table.createdAt'),
  ];

  const excelRows = rows.map((row) => [
    row.id,
    formatTransactionAmount(row.amount, row.currency),
    row.currency.toUpperCase(),
    t(`status.${row.status}` as `status.${TransactionStatus}`),
    row.customer.name,
    row.customer.email,
    format(formatTransactionDate(row.created_at), 'yyyy-MM-dd HH:mm:ss'),
  ]);

  const table = [headers, ...excelRows]
    .map(
      (line) =>
        `<tr>${line
          .map((value) => `<td>${escapeExcelValue(value)}</td>`)
          .join('')}</tr>`,
    )
    .join('');
  const workbook = `<html><body><table>${table}</table></body></html>`;
  const blob = new Blob([workbook], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `transactions-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeExcelValue(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
