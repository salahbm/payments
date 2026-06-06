import { PropsWithChildren } from 'react';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';

import AlertProvider from './alert';
import Internationalization from './intl';
import IntlErrorHandlingProvider from './intl-error';
import QueryProvider from './query';
import ThemeProvider from './theme';
import ZodInitProvider from './zod';

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Internationalization>
        <IntlErrorHandlingProvider>
          <AlertProvider>
            <QueryProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </QueryProvider>
          </AlertProvider>
          <Toaster />
          <ZodInitProvider />
        </IntlErrorHandlingProvider>
      </Internationalization>
    </ThemeProvider>
  );
}
