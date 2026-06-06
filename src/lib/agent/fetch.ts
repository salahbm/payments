import Cookies from 'js-cookie';

import { COOKIE_KEYS } from '@/constants/cookies';

import { env } from '@/env';
import { ApiPaginatedApiResponse } from '@/types/response';

import { ApiError } from '../api-error';

export interface AgentConfig {
  token?: string;
}

export interface RequestConfig {
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

function getAuthorizationHeader(token?: string): string | undefined {
  const rawToken =
    token ??
    (typeof window !== 'undefined'
      ? Cookies.get(COOKIE_KEYS.ACCESS_TOKEN)
      : undefined);

  if (!rawToken) return undefined;

  return rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
}

function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  // Strip leading slash from path so it resolves relative to the full base URL
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

export class Agent {
  private baseURL: string;
  private defaultTimeout: number;
  private token?: string;

  constructor(config?: AgentConfig) {
    this.baseURL = env.NEXT_PUBLIC_API_BASE_URL;
    this.defaultTimeout = 10000;
    this.token = config?.token;
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
    const authorization = getAuthorizationHeader(this.token);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
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
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          0,
          timedOut ? 'Request timed out' : 'Request cancelled',
        );
      }

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

export const agent = new Agent();
