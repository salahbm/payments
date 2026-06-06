'use client';

import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Link } from '@/i18n/routing';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const Breadcrumb = ({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) => {
  const visibleItems = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'typo-caption-1 flex min-w-0 items-center gap-1',
        className,
      )}
    >
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        const content = <span className="truncate">{item.label}</span>;

        return (
          <div
            key={`${item.label}-${index}`}
            className="flex min-w-0 items-center gap-1"
          >
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex min-w-0 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {content}
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1 text-foreground">
                {content}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
