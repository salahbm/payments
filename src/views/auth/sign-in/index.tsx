'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { FormFields } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input, PasswordInput } from '@/components/ui/input';

import { routes } from '@/constants/routes';

import { SignInType, signInSchema } from '@/hooks/auth/auth.schema';
import { useSignIn } from '@/hooks/auth/use-sign-in';
import { Link, useRouter } from '@/i18n/routing';

export function SignInView() {
  const router = useRouter();
  const t = useTranslations('auth');
  const { mutate: signIn, isPending: isLoading } = useSignIn();

  const form = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignInType) => {
    signIn(data, {
      onSuccess: () => {
        form.reset();
        router.push(routes.home);
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="typo-header">{t('signIn.title')}</h1>
          <p className="typo-body-2 mt-2 text-muted-foreground">
            {t('signIn.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormFields
              name="email"
              label={t('signIn.emailLabel')}
              required
              control={form.control}
              render={({ field }) => (
                <Input
                  placeholder={t('signIn.emailPlaceholder')}
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              )}
            />

            <FormFields
              name="password"
              label={t('signIn.passwordLabel')}
              required
              control={form.control}
              render={({ field }) => (
                <PasswordInput
                  placeholder={t('signIn.passwordPlaceholder')}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="typo-body-2 text-primary hover:underline"
              >
                {t('signIn.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('signIn.buttonLoading') : t('signIn.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="typo-caption-1 text-center">
              {t('signIn.noAccount')}{' '}
              <Link href="/sign-up" className="text-primary hover:underline">
                {t('signIn.signUpLink')}
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
