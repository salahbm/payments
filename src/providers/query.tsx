'use client';

import { type PropsWithChildren, useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ApiError } from '@/lib/api-error';
import { queryClient } from '@/lib/query-client';

import { env } from '@/env';
import { useError } from '@/hooks/common/use-error';

/**
 * Determines if an error should be retried.
 * Don't retry:
 * - Network errors (status 0) — connection failures
 * - Client errors (4xx) except 408 (Request Timeout) and 429 (Too Many Requests)
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError) {
    // Don't retry network errors — user needs to fix connection first
    if (error.isNetworkError) return false;

    // Don't retry client errors except specific cases
    if (error.isClientError) {
      if (error.status === 408 || error.status === 429) {
        return failureCount < 1;
      }
      return false;
    }

    // Retry server errors (5xx) up to 2 times
    return failureCount < 1;
  }

  // Don't retry unknown errors
  return false;
};

const QueryProvider = ({ children }: PropsWithChildren) => {
  const { errorHandler } = useError();

  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    const mutationCache = queryClient.getMutationCache();
    const defaultOptions = queryClient.getDefaultOptions();
    const previousQueryCacheConfig = { ...queryCache.config };
    const previousMutationCacheConfig = { ...mutationCache.config };

    queryCache.config.onError = (error) => {
      errorHandler(error, { source: 'query' });
    };

    queryCache.config.onSuccess = (data, query) => {
      if (env.NODE_ENV === 'development') {
        console.info(
          'Query Success:',
          JSON.stringify(
            {
              hasData: data !== undefined && data !== null,
              queryKey: query.queryKey,
            },
            null,
            2,
          ),
        );
      }
    };

    mutationCache.config.onError = (error) => {
      errorHandler(error, { source: 'mutation' });
    };

    mutationCache.config.onSuccess = (data) => {
      if (env.NODE_ENV === 'development') {
        console.info(
          'Mutation Success:',
          JSON.stringify(
            { hasData: data !== undefined && data !== null },
            null,
            2,
          ),
        );
      }
    };

    // Configure default options with retry logic
    queryClient.setDefaultOptions({
      ...defaultOptions,
      queries: {
        ...defaultOptions.queries,
        retry: shouldRetry,
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      /**
       * I did not add retry logic for mutations because it can cause unexpected behavior
       * like creating duplicate records or other issues.
       */
      mutations: {
        ...defaultOptions.mutations,
        retry: false,
      },
    });

    // Cleanup: reset error handlers on unmount
    return () => {
      queryCache.config.onError = previousQueryCacheConfig.onError;
      queryCache.config.onSuccess = previousQueryCacheConfig.onSuccess;
      mutationCache.config.onError = previousMutationCacheConfig.onError;
      mutationCache.config.onSuccess = previousMutationCacheConfig.onSuccess;
    };
  }, [errorHandler]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;
