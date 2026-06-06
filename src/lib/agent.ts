import { env } from '@/env';
import { ApiPaginatedApiResponse } from '@/types/response';

import { ApiError } from './api-error';

export interface RequestConfig {
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, cleanBase);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

const origin = typeof window !== 'undefined' ? window.location.origin : '';

class Agent {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string, timeout?: number) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout ?? env.TIMEOUT;
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      headers: configHeaders,
      signal: externalSignal,
    } = config ?? {};

    const fullUrl = buildUrl(this.baseURL, url, params);
    const isServer = typeof window === 'undefined';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...configHeaders,
    };

    // Unified abort controller for timeout + optional external signal
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        // credentials only applies in browser — sends httpOnly cookies automatically
        ...(isServer ? {} : { credentials: 'include' as const }),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      // In case of timeout or cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          0,
          timedOut ? 'Request timed out' : 'Request cancelled',
        );
      }

      // In case of other errors, eg. network issues
      throw new ApiError(0, 'Network error - Please check your connection');
    }

    clearTimeout(timeoutId);

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // Empty or non-JSON body — leave data as null
    }

    if (!response.ok) {
      const errorData = data as Record<string, unknown> | null;
      throw new ApiError(
        response.status,
        (errorData?.message as string) ??
          response.statusText ??
          'Request failed',
        errorData,
      );
    }

    return data as T;
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async getPaginated<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiPaginatedApiResponse<T>> {
    return this.request<ApiPaginatedApiResponse<T>>(
      'GET',
      url,
      undefined,
      config,
    );
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}

/** Agent for external backend API calls */
export const api = new Agent(env.NEXT_PUBLIC_API_BASE_URL);

/** Agent for internal Next.js API routes (same-origin) */
export const app = new Agent(origin);
