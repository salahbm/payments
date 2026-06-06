'use client';

import { useCallback, useRef } from 'react';

import { toast } from 'sonner';

import { ApiError } from '@/lib/api-error';
import { queryClient } from '@/lib/query-client';

import { routes } from '@/constants/routes';

import { useAlert } from '@/providers/alert';
import { useUserStore } from '@/store/user-store';

export type ErrorSource = 'query' | 'mutation' | 'manual';

export interface ErrorHandlerContext {
  source?: ErrorSource;
}

const fallbackMessage = 'Something went wrong';

const sessionErrorCodePatterns = ['SESSION_EXPIRED', 'TOKEN_EXPIRED'];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const getApiErrorCode = (error: ApiError): string | undefined => {
  if (!error.data || typeof error.data !== 'object') {
    return undefined;
  }

  const data = error.data as Record<string, unknown>;
  const nestedData = data.data;

  if (typeof data.code === 'string') {
    return data.code;
  }

  if (nestedData && typeof nestedData === 'object') {
    const nestedCode = (nestedData as Record<string, unknown>).code;

    if (typeof nestedCode === 'string') {
      return nestedCode;
    }
  }

  return undefined;
};

const isSessionExpiredError = (
  error: ApiError,
  context?: ErrorHandlerContext,
): boolean => {
  if (error.status !== 401) {
    return false;
  }

  const code = getApiErrorCode(error);

  if (
    code &&
    sessionErrorCodePatterns.some((pattern) => code.includes(pattern))
  ) {
    return true;
  }

  return context?.source === 'query';
};

export const useError = () => {
  const alert = useAlert();
  const { removeUser } = useUserStore();
  const isUnauthorizedAlertOpen = useRef(false);

  const handleLogout = useCallback(() => {
    removeUser();
    queryClient.clear();
    window.location.href = routes.signIn;
  }, [removeUser]);

  const showToastError = useCallback((message: string) => {
    toast.error(message || fallbackMessage);
  }, []);

  const errorHandler = useCallback(
    (error: unknown, context?: ErrorHandlerContext) => {
      if (process.env.NODE_ENV === 'development') {
        console.info(
          '[USE-ERROR] error:',
          JSON.stringify(
            {
              message: getErrorMessage(error),
              source: context?.source,
              status: error instanceof ApiError ? error.status : undefined,
            },
            null,
            2,
          ),
        );
      }

      if (error instanceof ApiError) {
        if (isSessionExpiredError(error, context)) {
          if (isUnauthorizedAlertOpen.current) return;

          isUnauthorizedAlertOpen.current = true;

          void alert({
            title: 'Session expired',
            description: error.message,
            confirmText: 'Sign in',
            cancelButton: null,
            onConfirm: handleLogout,
          }).finally(() => {
            isUnauthorizedAlertOpen.current = false;
          });
          return;
        }

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

      showToastError(getErrorMessage(error));
    },
    [alert, handleLogout, showToastError],
  );

  return { errorHandler };
};
