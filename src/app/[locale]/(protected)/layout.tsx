import React, { Suspense } from 'react';

import Header from '@/components/shared/header/header';
import Sidebar from '@/components/shared/sidebar/trigger';
import Loader from '@/components/ui/loader';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loader />}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div
          data-scroll-container="protected"
          className="h-[calc(100vh-4rem)] w-full overflow-y-auto"
        >
          <main className="px-4 py-6 md:px-6 lg:px-8 lg:pb-8 xl:px-12">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
