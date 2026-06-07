'use client';

import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';

import { usePathname } from '@/i18n/routing';
import { useAlert } from '@/providers/alert';
import { useEnvironmentStore } from '@/store/environment-store';
import { Environment } from '@/types/transaction';

type EnvironmentSwitchProps = {
  className?: string;
  defaultValue?: Environment;
  onValueChange?: (value: Environment) => void;
};

const options: Array<{ label: string; value: Environment }> = [
  { label: 'Sandbox', value: 'sandbox' },
  { label: 'Production', value: 'production' },
];

export function EnvironmentSwitch({
  className,
  onValueChange,
}: EnvironmentSwitchProps) {
  const alert = useAlert();
  const locale = useLocale();
  const pathname = usePathname();
  const { environment: value, setEnvironment } = useEnvironmentStore();

  const commitChange = (nextValue: Environment) => {
    setEnvironment(nextValue);
    onValueChange?.(nextValue);

    if (pathname.startsWith('/transactions/')) {
      window.location.assign(`/${locale}/transactions`);
    }
  };

  const handleChange = (nextValue: Environment) => {
    if (nextValue === value) return;

    if (nextValue === 'production') {
      alert({
        title: 'Are you sure?',
        description: 'This will switch the environment to production.',
        confirmText: 'Switch',
        cancelText: 'Cancel',
        onConfirm: () => {
          commitChange(nextValue);
        },
      });
    } else {
      commitChange(nextValue);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Payment environment"
      className={cn(
        'relative grid h-9 grid-cols-2 overflow-hidden rounded-xl border bg-muted/40 p-1 shadow-xs lg:h-10',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm transition-transform duration-300 ease-out',
          value === 'production' && 'translate-x-full',
        )}
      />
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleChange(option.value)}
            className={cn(
              'typo-body-2 relative z-1 min-w-24 rounded-lg px-3 tracking-wide uppercase transition-colors duration-300',
              isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
