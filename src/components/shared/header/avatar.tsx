'use client';

import { Globe, Palette, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { routes } from '@/constants/routes';

import { useSignOut } from '@/hooks/auth/use-sign-out';
import { Link } from '@/i18n/routing';
import { useUserStore } from '@/store/user-store';

import { LanguageMenuItems } from './language-toggle';
import { ThemeMenuItems } from './theme-toggle';

const Avatar = () => {
  const { isLoggedIn, user } = useUserStore();
  const { mutate: signOut, isPending } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-full"
          disabled={isPending}
        >
          <User className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Avatar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount className="w-52">
        <DropdownMenuItem asChild>
          <Link href={routes.preferences}>{user?.name || 'Profile'}</Link>
        </DropdownMenuItem>
        {isLoggedIn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="size-4" />
              Language
            </DropdownMenuLabel>
            <LanguageMenuItems />
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
              <Palette className="size-4" />
              Theme
            </DropdownMenuLabel>
            <ThemeMenuItems />
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onClick={() => signOut()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Avatar;
