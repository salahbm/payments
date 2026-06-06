import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

interface DataTableSkeletonProps extends React.ComponentProps<'div'> {
  columnCount: number;
  rowCount?: number;
  cellWidths?: string[];
  shrinkZero?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 8,
  cellWidths = ['auto'],
  shrinkZero = false,
  className,
  ...props
}: DataTableSkeletonProps) {
  const cozyCellWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? 'auto',
  );

  return (
    <div
      className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)}
      {...props}
    >
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="hidden h-7 w-[4.5rem] lg:flex" />
        <Skeleton className="hidden h-7 w-[4.5rem] lg:flex" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : 'auto',
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : 'auto',
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
        <Skeleton className="h-7 w-32 shrink-0" />
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="hidden size-7 lg:block" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
            <Skeleton className="hidden size-7 lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
