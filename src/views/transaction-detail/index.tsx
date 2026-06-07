'use client';

import { format } from 'date-fns';
import {
  CalendarClock,
  Copy,
  CreditCard,
  ExternalLink,
  Hash,
  Mail,
  ReceiptText,
  Tags,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

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
import { useEnvironmentStore } from '@/store/environment-store';
import { TransactionStatus } from '@/types/transaction';

import { StatusActions } from './status-actions';
import { DetailLine, MetadataBlock, SummaryItem } from './tx-detail-blocks';

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
        <section className="rounded border bg-background p-6">
          <h1 className="typo-header">{t('notFound.title')}</h1>
          <p className="typo-body-2 mt-2 text-muted-foreground">
            {t('notFound.description')}
          </p>
        </section>
      </div>
    );
  }

  const copyValue = async (value: string, message: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: transactionsT('title'), href: '/transactions' },
            { label: data.id },
          ]}
        />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="typo-header">{data.id}</h1>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="ml:ml-0 ml-auto"
                onClick={() => copyValue(data.id, t('actions.copiedId'))}
              >
                <Copy className="size-4" />
                {t('actions.copyId')}
              </Button>
            </div>
            <p className="typo-body-2 mt-2 text-muted-foreground">
              {isFetching ? t('sync.syncing') : t('sync.live')}
            </p>
          </div>
          <div className="flex items-center justify-between gap-6 lg:justify-end">
            <TransactionStatusBadge
              status={data.status}
              label={t(
                `status.${data.status}` as `status.${TransactionStatus}`,
              )}
            />
            <StatusActions status={data.status} t={t} />
          </div>
        </div>
      </div>

      <section className="grid gap-4 rounded border bg-background p-4 md:grid-cols-4 md:p-5">
        <SummaryItem
          icon={ReceiptText}
          label={t('summary.amount')}
          value={formatTransactionAmount(data.amount, data.currency)}
        />
        <SummaryItem
          icon={Hash}
          label={t('summary.currency')}
          value={data.currency.toUpperCase()}
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
            <DetailLine
              label={t('customer.id')}
              value={data.customer.id ?? '-'}
            />
            <DetailLine label={t('customer.name')} value={data.customer.name} />
            <DetailLine
              label={t('customer.email')}
              value={data.customer.email}
              icon={Mail}
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                copyValue(data.customer.email, t('actions.copiedEmail'))
              }
            >
              <Copy className="size-4" />
              {t('actions.copyEmail')}
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${data.customer.email}`}>
                <ExternalLink className="size-4" />
                {t('actions.emailCustomer')}
              </a>
            </Button>
          </div>
          <Separator className="my-5" />
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('paymentMethod.title')}</h2>
          </div>
          <div className="space-y-3">
            <DetailLine
              label={t('paymentMethod.type')}
              value={data.payment_method.type}
            />
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
          <Separator className="my-5" />
          <div className="mb-4 flex items-center gap-2">
            <Tags className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('metadata.title')}</h2>
          </div>
          <MetadataBlock metadata={data.metadata} t={t} />
        </section>

        <section className="rounded border bg-background p-4 md:p-5">
          <h2 className="typo-body-1 mb-4">{t('timeline.title')}</h2>
          {data.events.length ? (
            <ol className="relative space-y-0 pl-8 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-px before:bg-border">
              {data.events.reverse().map((event, index) => (
                <li
                  key={`${event.type}-${event.at}`}
                  className="relative pb-5 last:pb-0"
                >
                  <span className="absolute top-1 -left-8 z-1 flex size-6 items-center justify-center rounded-full border bg-background shadow-xs">
                    <span className="typo-caption-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {index + 1}
                    </span>
                  </span>

                  <div className="rounded border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="typo-body-1 capitalize">{event.type}</p>
                        <p className="typo-caption-1 mt-1 text-muted-foreground">
                          {format(formatTransactionDate(event.at), 'PPP p')}
                        </p>
                      </div>
                      {index === data.events.length - 1 && (
                        <span className="typo-caption-2 rounded bg-muted px-2 py-0.5 text-muted-foreground">
                          {t('timeline.latest')}
                        </span>
                      )}
                    </div>
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
