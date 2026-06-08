'use client';

import { useCallback } from 'react';

import { toast } from 'sonner';

import { ApiError } from '@/lib/api-error';

import { env } from '@/env';
import { useAlert } from '@/providers/alert';

export type ErrorSource = 'query' | 'mutation' | 'manual';

export interface ErrorHandlerContext {
  source?: ErrorSource;
}

export const useError = () => {
  const alert = useAlert();

  const showToastError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const errorHandler = useCallback(
    (error: unknown, context?: ErrorHandlerContext) => {
      if (env.NODE_ENV === 'development') {
        console.info(
          '[USE-ERROR] error:',
          JSON.stringify(
            {
              error,
              source: context?.source,
              status: error instanceof ApiError ? error.status : undefined,
            },
            null,
            2,
          ),
        );
      }

      if (error instanceof ApiError) {
        if (error.isNetworkError) {
          return;
        }

        if (error.isClientError) {
          showToastError(error.message);
          return;
        }

        void alert({
          title: 'Something went wrong',
          description: error.message,
          confirmText: 'OK',
          cancelButton: null,
        });
        return;
      }

      if (context?.source === 'query') {
        return;
      }

      showToastError((error as Error).message);
    },
    [alert, showToastError],
  );

  return { errorHandler };
};
