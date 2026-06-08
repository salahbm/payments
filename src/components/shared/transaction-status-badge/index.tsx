import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

import { statusVariantClassName } from '@/utils/transactions';

import { TransactionStatus } from '@/types/transaction';

interface TransactionStatusBadgeProps {
  label: string;
  status: TransactionStatus;
}

export function TransactionStatusBadge({
  label,
  status,
}: TransactionStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('capitalize', statusVariantClassName[status])}
    >
      {label}
    </Badge>
  );
}
