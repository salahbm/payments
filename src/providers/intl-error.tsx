'use client';

import { NextIntlClientProvider, useLocale } from 'next-intl';

export default function IntlErrorHandlingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <NextIntlClientProvider
      locale={locale}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE') {
          console.info('Missing translation in client: ', error.message);
        }
      }}
      getMessageFallback={({ namespace, key }) =>
        `${[namespace, key].filter(Boolean).join('.')} ❌`
      }
    >
      {children}
    </NextIntlClientProvider>
  );
}
