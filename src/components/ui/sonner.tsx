'use client';

import { CircleAlert, CircleCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      icons={{
        error: <CircleAlert className="size-5 text-destructive" />,
        success: <CircleCheck className="size-5 text-green-500" />,
      }}
      gap={12}
      toastOptions={{
        classNames: {
          content: 'gap-3',
          title: 'typo-body-2',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
