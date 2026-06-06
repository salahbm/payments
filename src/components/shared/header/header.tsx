'use client';

import Image from 'next/image';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { BRAND } from '@/constants/brand';
import { IMAGES } from '@/constants/images';

import { Link } from '@/i18n/routing';
import { useSidebar } from '@/store/sidebar';
import { useUserStore } from '@/store/user-store';

import Avatar from './avatar';
import { EnvironmentSwitch } from './environment-switch';
import { LanguageToggle } from './language-toggle';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const { toggle } = useSidebar();
  const { isLoggedIn } = useUserStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* <div className="flex items-center gap-1 md:gap-0 lg:gap-4"> */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggle()}
          className={cn('lg:hidden', !isLoggedIn && 'hidden')}
          aria-label="toggleSidebar"
        >
          <Menu className="size-5" />
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={IMAGES.logo}
            alt="Payments Logo"
            width={40}
            height={40}
            className="size-6 lg:size-12"
            priority
          />
          <h1 className="text-md font-roboto linear-gradient font-bold lg:text-2xl">
            {BRAND.name}
          </h1>
        </Link>
        {/* </div> */}
        <div className="flex items-center gap-1 lg:gap-3">
          {isLoggedIn ? (
            <>
              <EnvironmentSwitch className="hidden lg:grid" />
              <Avatar />
            </>
          ) : (
            <>
              <LanguageToggle />
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
