'use client';

import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Hash,
  Mail,
  ReceiptText,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TransactionStatusBadge } from '@/components/shared/transaction-status-badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { Separator } from '@/components/ui/separator';

import {
  formatTransactionAmount,
  formatTransactionDate,
} from '@/utils/transactions';

import { useGetTransaction } from '@/hooks/transactions';
import { Link } from '@/i18n/routing';
import { useEnvironmentStore } from '@/store/environment-store';
import { TransactionStatus } from '@/types/transaction';

interface TransactionDetailViewProps {
  id: string;
}

export default function TransactionDetailView({
  id,
}: TransactionDetailViewProps) {
  const t = useTranslations('transactionDetail');
  const transactionsT = useTranslations('transactions');
  const { environment } = useEnvironmentStore();
  const { data, isFetching, isLoading } = useGetTransaction({
    environment,
    id,
  });

  if (isLoading) return <Loader />;

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: transactionsT('title'), href: '/transactions' },
            { label: t('notFound.title') },
          ]}
        />
        <Button asChild variant="outline" className="w-fit">
          <Link href="/transactions">
            <ArrowLeft className="size-4" />
            {t('back')}
          </Link>
        </Button>
        <section className="rounded border bg-background p-6">
          <h1 className="typo-header">{t('notFound.title')}</h1>
          <p className="typo-body-2 mt-2 text-muted-foreground">
            {t('notFound.description')}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: transactionsT('title'), href: '/transactions' },
          { label: data.id },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" className="w-fit">
            <Link href="/transactions">
              <ArrowLeft className="size-4" />
              {t('back')}
            </Link>
          </Button>
          <div>
            <h1 className="typo-header">{data.id}</h1>
            <p className="typo-body-2 mt-2 text-muted-foreground">
              {isFetching ? t('sync.syncing') : t('sync.live')}
            </p>
          </div>
        </div>
        <TransactionStatusBadge
          status={data.status}
          label={t(`status.${data.status}` as `status.${TransactionStatus}`)}
        />
      </div>

      <section className="grid gap-4 rounded border bg-background p-4 md:grid-cols-3 md:p-5">
        <SummaryItem
          icon={ReceiptText}
          label={t('summary.amount')}
          value={formatTransactionAmount(data.amount, data.currency)}
        />
        <SummaryItem
          icon={CalendarClock}
          label={t('summary.createdAt')}
          value={format(formatTransactionDate(data.created_at), 'PPP p')}
        />
        <SummaryItem
          icon={Hash}
          label={t('summary.order')}
          value={data.metadata.order_id ?? '-'}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded border bg-background p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('customer.title')}</h2>
          </div>
          <div className="space-y-3">
            <DetailLine label={t('customer.name')} value={data.customer.name} />
            <DetailLine
              label={t('customer.email')}
              value={data.customer.email}
              icon={Mail}
            />
          </div>
          <Separator className="my-5" />
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('paymentMethod.title')}</h2>
          </div>
          <div className="space-y-3">
            <DetailLine
              label={t('paymentMethod.brand')}
              value={data.payment_method.brand.toUpperCase()}
            />
            <DetailLine
              label={t('paymentMethod.last4')}
              value={`•••• ${data.payment_method.last4}`}
            />
            <DetailLine
              label={t('paymentMethod.expiry')}
              value={`${data.payment_method.exp_month}/${data.payment_method.exp_year}`}
            />
          </div>
        </section>

        <section className="rounded border bg-background p-4 md:p-5">
          <h2 className="typo-body-1 mb-4">{t('timeline.title')}</h2>
          {data.events.length ? (
            <ol className="space-y-4">
              {data.events.map((event, index) => (
                <li key={`${event.type}-${event.at}`} className="flex gap-3">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background">
                    <span className="size-2 rounded-full bg-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="typo-body-2">{event.type}</span>
                      {index === data.events.length - 1 && (
                        <span className="typo-caption-2 rounded bg-muted px-2 py-0.5 text-muted-foreground">
                          {t('timeline.latest')}
                        </span>
                      )}
                    </div>
                    <p className="typo-caption-1 mt-1 text-muted-foreground">
                      {format(formatTransactionDate(event.at), 'PPP p')}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded border border-dashed p-6 text-center">
              <p className="typo-body-1">{t('timeline.emptyTitle')}</p>
              <p className="typo-body-2 mt-2 text-muted-foreground">
                {t('timeline.emptyDescription')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryItem({
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

function DetailLine({
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
