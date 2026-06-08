import { Fragment } from 'react';

import Header from '@/components/shared/header/header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <Header />
      {children}
    </Fragment>
  );
}
