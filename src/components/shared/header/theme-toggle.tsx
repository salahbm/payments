'use client';

import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeMenuItems() {
  const { setTheme, theme } = useTheme();

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme('light')}>
        Light
        {theme === 'light' && (
          <Check className="ml-auto h-4 w-4 text-primary" />
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('dark')}>
        Dark
        {theme === 'dark' && <Check className="ml-auto h-4 w-4 text-primary" />}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('system')}>
        System
        {theme === 'system' && (
          <Check className="ml-auto h-4 w-4 text-primary" />
        )}
      </DropdownMenuItem>
    </>
  );
}

export function ThemeToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ThemeMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
