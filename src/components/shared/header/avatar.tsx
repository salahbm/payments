'use client';

import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { routes } from '@/constants/routes';

import { useSignOut } from '@/hooks/auth/use-sign-out';
import { Link } from '@/i18n/routing';

const Avatar = () => {
  const { mutate: signOut, isPending } = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <User className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Avatar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount className="w-40">
        <DropdownMenuItem asChild>
          <Link href={routes.preferences}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isPending} onClick={() => signOut()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Avatar;
