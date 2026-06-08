'use client';

import { useState } from 'react';

import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  highlightedRowIds?: Set<string>;
  isLoading?: boolean;
  t: Translate;
}

export function TransactionTable({
  data,
  emptyDescription,
  emptyTitle,
  highlightedRowIds,
  isLoading,
  t,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns: getTransactionColumns(t),
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });
  const isAnyColumnHidden = table
    .getAllLeafColumns()
    .some((column) => !column.getIsVisible());

  return (
    <div className="overflow-hidden rounded border">
      {isAnyColumnHidden && (
        <div className="flex justify-end border-b bg-background p-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => table.resetColumnVisibility()}
          >
            <RotateCcw className="size-4" />
            {t('actions.resetColumns')}
          </Button>
        </div>
      )}
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
              <TableRow
                key={row.id}
                className={cn(
                  highlightedRowIds?.has(row.original.id) &&
                    'animate-new-transaction-row',
                )}
              >
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
                colSpan={table.getVisibleLeafColumns().length}
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
