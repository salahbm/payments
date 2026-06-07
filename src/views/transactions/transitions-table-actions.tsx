'use client';

import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import z from 'zod';

import { DatePicker } from '@/components/shared/date-pickers';
import { FormFields } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { TransactionStatus } from '@/types/transaction';

export function buildStatusDefaults(
  statusParam: string | null,
): StatusDefaults {
  const selectedStatuses =
    statusParam
      ?.split(',')
      .filter((status): status is TransactionStatus =>
        TRANSACTION_STATUSES.includes(status as TransactionStatus),
      ) ?? TRANSACTION_STATUSES;

  return {
    all: selectedStatuses.length === TRANSACTION_STATUSES.length,
    failed: selectedStatuses.includes('failed'),
    pending: selectedStatuses.includes('pending'),
    refunded: selectedStatuses.includes('refunded'),
    succeeded: selectedStatuses.includes('succeeded'),
  };
}

export const TRANSACTION_STATUSES: TransactionStatus[] = [
  'pending',
  'succeeded',
  'failed',
  'refunded',
];

export type StatusDefaults = Pick<
  TransactionFilters,
  'all' | 'failed' | 'pending' | 'refunded' | 'succeeded'
>;

export const PAGE_SIZE = 20;

export const transactionFiltersSchema = z.object({
  all: z.boolean(),
  failed: z.boolean(),
  interval: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  pending: z.boolean(),
  refunded: z.boolean(),
  search: z.string(),
  succeeded: z.boolean(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;

type TransactionsTableActionsProps = {
  form: UseFormReturn<TransactionFilters>;
  onConfirm: (_values: TransactionFilters) => void;
  onReset: () => void;
  t: ReturnType<typeof useTranslations>;
};

export const TransactionsTableActions = ({
  form,
  onConfirm,
  onReset,
  t,
}: TransactionsTableActionsProps) => {
  const all = form.watch('all');
  const failed = form.watch('failed');
  const pending = form.watch('pending');
  const refunded = form.watch('refunded');
  const succeeded = form.watch('succeeded');

  const setAllStatuses = (checked: boolean) => {
    form.setValue('all', checked);
    form.setValue('failed', checked);
    form.setValue('pending', checked);
    form.setValue('refunded', checked);
    form.setValue('succeeded', checked);
  };

  const setStatus = (status: TransactionStatus, checked: boolean) => {
    form.setValue(status, checked);

    const nextStatuses = {
      failed,
      pending,
      refunded,
      succeeded,
      [status]: checked,
    };

    form.setValue(
      'all',
      TRANSACTION_STATUSES.every((item) => nextStatuses[item]),
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onConfirm)}
        className="flex flex-col items-start gap-4"
      >
        <FormFields
          name="search"
          label={t('filters.search')}
          control={form.control}
          className="grid w-full grid-cols-1 gap-2 md:grid-cols-[200px_400px]"
          render={({ field }) => (
            <Input
              {...field}
              type="search"
              placeholder={t('searchPlaceholder')}
            />
          )}
        />
        <FormFields
          name="interval"
          label={t('filters.timeWindow')}
          control={form.control}
          className="grid w-full grid-cols-1 gap-2 md:grid-cols-[200px_400px]"
          render={({ field }) => (
            <DatePicker
              {...field}
              variant="range"
              placeholder="placeholder.dateRange"
            />
          )}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_600px]">
          <p className="typo-body-1">{t('filters.status')}</p>
          <div className="flex flex-wrap gap-3 lg:gap-6">
            <FormFields
              name="all"
              control={form.control}
              render={() => (
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={all}
                    onChange={(checked) => setAllStatuses(Boolean(checked))}
                  />
                  <span className="typo-caption-1">{t('status.all')}</span>
                </label>
              )}
            />
            {TRANSACTION_STATUSES.map((status) => (
              <FormFields
                key={status}
                name={status}
                control={form.control}
                render={({ field }) => (
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onChange={(checked) =>
                        setStatus(status, Boolean(checked))
                      }
                    />
                    <span className="typo-caption-1">
                      {t(`status.${status}` as `status.${TransactionStatus}`)}
                    </span>
                  </label>
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex w-full justify-end gap-2">
          <Button
            type="button"
            className="w-32"
            variant="outline"
            onClick={onReset}
          >
            {t('actions.reset')}
          </Button>
          <Button type="submit" className="w-40">
            {t('actions.confirm')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
