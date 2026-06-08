'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  className?: string;
}

export function ScrollToTop({ className }: ScrollToTopProps) {
  const t = useTranslations('Common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-scroll-container="protected"]',
    );
    const target = scrollContainer ?? window;
    const getScrollTop = () => scrollContainer?.scrollTop ?? window.scrollY;
    const handleScroll = () => setIsVisible(getScrollTop() > 480);

    handleScroll();
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-scroll-container="protected"]',
    );

    (scrollContainer ?? window).scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={t('scrollToTop')}
          onClick={handleClick}
          className={cn(
            'fixed right-4 bottom-4 z-9999 size-10 rounded-full bg-background shadow-xl transition-all duration-200 lg:right-10 lg:bottom-14',
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0',
            className,
          )}
        >
          <ArrowUp className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('scrollToTop')}</TooltipContent>
    </Tooltip>
  );
}
