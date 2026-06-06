import { RowData, type Table as TanstackTable } from '@tanstack/react-table';
import { UseFormReturn } from 'react-hook-form';

export interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  isLoading?: boolean;

  // classNames
  className?: string;
  tbodyClassName?: string;
  tableClassName?: string;
  theadClassName?: string;
  trHeaderClassName?: string;
  tdClassName?: string;
  trClassName?: string;
  paginationClassName?: string;

  // form control
  form?: UseFormReturn<TData>;
}

// Header Intl Cell
// Extend TableMeta to support `t` property
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    t?: (_key: string, _data?: TData) => string; // Now TData is being used
    form?: UseFormReturn<TData, unknown, undefined>;
    includePaginationReset?: boolean;
  }
}

// Tooltip
// Extend ColumnDef to support `tooltip` property
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData> {
    tooltip?: boolean | TData;
    form?: UseFormReturn<TData, unknown, undefined>;
    label?: string;
  }
}

// ****************************************************************

export interface ExtendedColumnSort<TData> {
  id: Extract<keyof TData, string>;
  desc: boolean;
}
