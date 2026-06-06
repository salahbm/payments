import * as React from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface YearPickerProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  yearsPerPage?: number;
}

export function YearPicker({
  value,
  onValueChange,
  minDate = new Date('1900-01-01'),
  maxDate = new Date('2100-12-31'),
  className,
  yearsPerPage = 12,
}: YearPickerProps) {
  // Use current date if no value is provided
  const currentDate = React.useMemo(() => value || new Date(), [value]);

  // Calculate the start year for the current view
  const [startYear, setStartYear] = React.useState(() => {
    const year = currentDate.getFullYear();
    return Math.floor(year / yearsPerPage) * yearsPerPage;
  });

  // Update start year when value changes
  React.useEffect(() => {
    if (value) {
      const year = value.getFullYear();
      setStartYear(Math.floor(year / yearsPerPage) * yearsPerPage);
    }
  }, [value, yearsPerPage]);

  // Navigate to previous year range
  const handlePrevYearRange = React.useCallback(() => {
    setStartYear((prev) =>
      Math.max(minDate.getFullYear(), prev - yearsPerPage),
    );
  }, [minDate, yearsPerPage]);

  // Navigate to next year range
  const handleNextYearRange = React.useCallback(() => {
    setStartYear((prev) => {
      const nextStart = prev + yearsPerPage;
      return nextStart <= maxDate.getFullYear() ? nextStart : prev;
    });
  }, [maxDate, yearsPerPage]);

  // Select a year
  const handleSelectYear = React.useCallback(
    (year: number) => {
      if (!onValueChange) return;

      const newDate = new Date(currentDate);
      newDate.setFullYear(year);

      // Ensure date is within min/max range
      if (newDate < minDate) {
        onValueChange(new Date(minDate));
      } else if (newDate > maxDate) {
        onValueChange(new Date(maxDate));
      } else {
        onValueChange(newDate);
      }
    },
    [currentDate, onValueChange, minDate, maxDate],
  );

  // Calculate end year for display
  const endYear = Math.min(startYear + yearsPerPage - 1, maxDate.getFullYear());

  // Check if navigation buttons should be disabled
  const isPrevDisabled = startYear <= minDate.getFullYear();
  const isNextDisabled = startYear + yearsPerPage > maxDate.getFullYear();

  return (
    <div className={cn('p-3', className)}>
      <div className="flex flex-col space-y-4">
        {/* Year range navigation */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrevYearRange}
              disabled={isPrevDisabled}
              className={cn(
                'rounded p-2',
                isPrevDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
              aria-label="Previous year range"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="min-w-[100px] text-center text-sm font-medium">
              {startYear} - {endYear}
            </div>
            <button
              type="button"
              onClick={handleNextYearRange}
              disabled={isNextDisabled}
              className={cn(
                'rounded p-2',
                isNextDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
              aria-label="Next year range"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Year grid */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: yearsPerPage }, (_, i) => {
            const year = startYear + i;
            if (year > maxDate.getFullYear()) return null;

            const isSelected =
              value instanceof Date && value.getFullYear() === year;
            const isDisabled =
              year < minDate.getFullYear() || year > maxDate.getFullYear();

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectYear(year)}
                disabled={isDisabled}
                className={cn(
                  'cursor-pointer rounded p-4 text-sm font-medium',
                  isDisabled && 'cursor-not-allowed opacity-50',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
