'use client';

import { Ban, CheckCircle2, ReceiptText, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { TransactionStatus } from '@/types/transaction';

type DetailTranslate = (_key: string) => string;

export function StatusActions({
  status,
  t,
}: {
  status: TransactionStatus;
  t: DetailTranslate;
}) {
  const actions = {
    failed: [
      {
        icon: RotateCcw,
        label: t('statusActions.retry'),
        variant: 'outline' as const,
      },
    ],
    pending: [
      {
        icon: CheckCircle2,
        label: t('statusActions.capture'),
        variant: 'default' as const,
      },
      {
        icon: Ban,
        label: t('statusActions.void'),
        variant: 'outline' as const,
      },
    ],
    refunded: [
      {
        icon: ReceiptText,
        label: t('statusActions.viewRefund'),
        variant: 'outline' as const,
      },
    ],
    succeeded: [
      {
        icon: RotateCcw,
        label: t('statusActions.refund'),
        variant: 'destructive' as const,
      },
    ],
  } satisfies Record<
    TransactionStatus,
    Array<{
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      variant: 'default' | 'destructive' | 'outline';
    }>
  >;

  return (
    <div className="lex-row flex gap-2 sm:items-center">
      {actions[status].map(({ icon: Icon, label, variant }) => (
        <Button
          key={label}
          type="button"
          size="sm"
          variant={variant}
          onClick={() => toast(t('statusActions.mocked'))}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
