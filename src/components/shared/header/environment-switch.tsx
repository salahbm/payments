'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

type Environment = 'sandbox' | 'production';

type EnvironmentSwitchProps = {
  defaultValue?: Environment;
  onValueChange?: (value: Environment) => void;
};

const options: Array<{ label: string; value: Environment }> = [
  { label: 'Sandbox', value: 'sandbox' },
  { label: 'Production', value: 'production' },
];

export function EnvironmentSwitch({
  defaultValue = 'sandbox',
  onValueChange,
}: EnvironmentSwitchProps) {
  const [value, setValue] = useState<Environment>(defaultValue);

  const handleChange = (nextValue: Environment) => {
    setValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Payment environment"
      className="grid h-8 grid-cols-2 rounded-full border-2 border-primary bg-background p-0.5"
    >
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
              'min-w-24 rounded-full px-3 text-xs font-bold tracking-wide uppercase transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
