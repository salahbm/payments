'use client';

import { TransactionMetadata } from '@/types/transaction';

type DetailTranslate = (_key: string) => string;

export function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="typo-caption-1 text-muted-foreground">{label}</p>
        <p className="typo-body-1 truncate">{value}</p>
      </div>
    </div>
  );
}

export function MetadataBlock({
  metadata,
  t,
}: {
  metadata: TransactionMetadata;
  t: DetailTranslate;
}) {
  const entries = Object.entries(metadata).filter(([, value]) => value);

  if (!entries.length) {
    return (
      <div className="rounded border border-dashed p-4 text-center">
        <p className="typo-body-2 text-muted-foreground">
          {t('metadata.empty')}
        </p>
      </div>
    );
  }

  const labels: Record<string, string> = {
    failure_reason: t('metadata.failureReason'),
    order_id: t('metadata.orderId'),
  };

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <DetailLine
          key={key}
          label={labels[key] ?? key}
          value={String(value)}
        />
      ))}
    </div>
  );
}

export function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="typo-body-2 flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-4" />}
        {label}
      </span>
      <span className="typo-body-2 min-w-0 truncate text-right">{value}</span>
    </div>
  );
}
