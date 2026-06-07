'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

import { TransactionListItem } from '@/types/transaction';

import { getTransactionColumns } from './columns';

type Translate = (_key: string) => string;

interface TransactionTableProps {
  data: TransactionListItem[];
  emptyDescription: string;
  emptyTitle: string;
  isLoading?: boolean;
  t: Translate;
}

export function TransactionTable({
  data,
  emptyDescription,
  emptyTitle,
  isLoading,
  t,
}: TransactionTableProps) {
  const table = useReactTable({
    data,
    columns: getTransactionColumns(t),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="overflow-hidden rounded border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(header.column.getCanSort() && 'cursor-pointer')}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-56 text-center"
              >
                <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                  <p className="typo-body-1">{emptyTitle}</p>
                  <p className="typo-body-2 text-muted-foreground">
                    {isLoading ? t('sync.syncing') : emptyDescription}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
