import * as React from 'react';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function MonthPicker({
  value,
  onValueChange,
  minDate = new Date('1900-01-01'),
  maxDate = new Date('2100-12-31'),
  className,
}: MonthPickerProps) {
  // Get current locale
  const locale = useLocale();
  const dateLocale = locale === 'ru' ? ru : undefined;

  // Use current date if no value is provided
  const currentDate = React.useMemo(() => value || new Date(), [value]);
  const [year, setYear] = React.useState(() => currentDate.getFullYear());

  // Update year when value changes
  React.useEffect(() => {
    if (value) {
      setYear(value.getFullYear());
    }
  }, [value]);

  // Navigate to previous year
  const handlePrevYear = React.useCallback(() => {
    setYear((prevYear) => Math.max(minDate.getFullYear(), prevYear - 1));
  }, [minDate]);

  // Navigate to next year
  const handleNextYear = React.useCallback(() => {
    setYear((prevYear) => Math.min(maxDate.getFullYear(), prevYear + 1));
  }, [maxDate]);

  // Select a month
  const handleSelectMonth = React.useCallback(
    (monthIndex: number) => {
      if (!onValueChange) return;

      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      newDate.setMonth(monthIndex);

      // Ensure date is within min/max range
      if (newDate < minDate) {
        onValueChange(new Date(minDate));
      } else if (newDate > maxDate) {
        onValueChange(new Date(maxDate));
      } else {
        onValueChange(newDate);
      }
    },
    [currentDate, year, onValueChange, minDate, maxDate],
  );

  return (
    <div className={cn('p-3', className)}>
      <div className="flex flex-col space-y-4">
        {/* Year navigation */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrevYear}
              disabled={year <= minDate.getFullYear()}
              className={cn(
                'rounded p-2',
                year <= minDate.getFullYear()
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
              aria-label="Previous year"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="min-w-[60px] text-center text-sm font-medium">
              {year}
            </div>
            <button
              type="button"
              onClick={handleNextYear}
              disabled={year >= maxDate.getFullYear()}
              className={cn(
                'rounded p-2',
                year >= maxDate.getFullYear()
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
              aria-label="Next year"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const monthDate = new Date(year, i, 1);
            const monthName = format(monthDate, 'MMM', { locale: dateLocale });
            const isSelected =
              value instanceof Date &&
              value.getMonth() === i &&
              value.getFullYear() === year;

            const isDisabled =
              (year === minDate.getFullYear() && i < minDate.getMonth()) ||
              (year === maxDate.getFullYear() && i > maxDate.getMonth());

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectMonth(i)}
                disabled={isDisabled}
                className={cn(
                  'cursor-pointer rounded p-4 text-sm font-medium capitalize',
                  isDisabled && 'cursor-not-allowed opacity-50',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
