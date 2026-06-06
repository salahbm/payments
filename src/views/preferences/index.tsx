'use client';

import {
  Check,
  Globe,
  Laptop,
  LogOut,
  Mail,
  Moon,
  Server,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { EnvironmentSwitch } from '@/components/shared/header/environment-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useSignOut } from '@/hooks/auth/use-sign-out';
import useTranslation from '@/hooks/common/use-translation';
import { useUserStore } from '@/store/user-store';

const themeOptions = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Laptop },
] as const;

const localeOptions = [
  { value: 'en' },
  { value: 'ru' },
  { value: 'kr' },
] as const;

const optionButtonClassName = 'h-11 justify-between rounded px-3 text-left';

export default function PreferencesView() {
  const t = useTranslations('preferences');
  const { theme, setTheme } = useTheme();
  const {
    currentLocale,
    handleLocale,
    isPending: isLocalePending,
  } = useTranslation();
  const { user, isLoggedIn } = useUserStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="typo-header">{t('title')}</h1>
          <Badge variant={isLoggedIn ? 'default' : 'outline'}>
            {isLoggedIn ? t('status.signedIn') : t('status.signedOut')}
          </Badge>
        </div>
        <p className="typo-body-2 max-w-2xl text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <section className="rounded border bg-background">
        <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center md:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
              <User className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="typo-body-1 truncate">
                {user?.name || t('account.fallbackName')}
              </h2>
              <div className="typo-body-2 mt-1 flex min-w-0 items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">
                  {user?.email || t('account.noUserStored')}
                </span>
              </div>
            </div>
          </div>
          <Button
            disabled={isSigningOut}
            onClick={() => signOut()}
            variant="outline"
            className="w-full gap-3 px-4 md:w-auto"
          >
            {isSigningOut ? t('account.signingOut') : t('account.signOut')}
            <LogOut className="size-4" />
          </Button>
        </div>
        <Separator />
        <div className="grid gap-3 p-4 md:grid-cols-3 md:p-5">
          <div className="typo-body-2 flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-4" />
            {t('account.ssrGuard')}
          </div>
          <div className="typo-body-2 flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            {t('account.csrState')}
          </div>
          <div className="typo-body-2 flex items-center gap-2 text-muted-foreground">
            <Server className="size-4" />
            {t('account.noSessionApi')}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded border bg-background p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sun className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('theme.title')}</h2>
          </div>
          <div className="grid gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setTheme(option.value)}
                  className={optionButtonClassName}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {t(`theme.options.${option.value}`)}
                  </span>
                  {isActive && <Check className="size-4" />}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="rounded border bg-background p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('language.title')}</h2>
          </div>
          <div className="grid gap-2">
            {localeOptions.map((option) => {
              const isActive = currentLocale === option.value;

              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  disabled={isLocalePending}
                  onClick={() => handleLocale(option.value)}
                  className={optionButtonClassName}
                >
                  <span>{t(`language.options.${option.value}`)}</span>
                  {isActive && <Check className="size-4" />}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="rounded border bg-background p-4 md:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Server className="size-5 text-primary" />
            <h2 className="typo-body-1">{t('environment.title')}</h2>
          </div>
          <EnvironmentSwitch className="w-full" />
          <p className="typo-body-2 mt-4 rounded border bg-muted/30 px-3 py-2 text-muted-foreground">
            {t('environment.description')}
          </p>
        </section>
      </div>
    </div>
  );
}
