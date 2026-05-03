import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const TOKEN_STORAGE_KEY = 'jwt_token';

export interface ApiError extends Error {
  status: number;
  errors: unknown;
  retryAfterSeconds: number | null;
}

const parseRetryAfterSeconds = (retryAfterHeader: unknown): number | null => {
  if (typeof retryAfterHeader === 'number' && Number.isFinite(retryAfterHeader)) {
    return Math.max(0, Math.floor(retryAfterHeader));
  }

  if (typeof retryAfterHeader === 'string') {
    const asNumber = Number.parseInt(retryAfterHeader, 10);
    if (Number.isFinite(asNumber)) {
      return Math.max(0, asNumber);
    }
  }

  return null;
};

const formatRetryAfter = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export const toApiError = (error: unknown): ApiError => {
  const apiError = new Error('An unexpected error occurred') as ApiError;
  apiError.retryAfterSeconds = null;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; messages?: unknown }>;

    if (axiosError.response) {
      apiError.status = axiosError.response.status;
      apiError.errors = axiosError.response.data?.messages || null;

      const retryAfterSeconds = parseRetryAfterSeconds(axiosError.response.headers?.['retry-after']);
      apiError.retryAfterSeconds = retryAfterSeconds;

      if (apiError.status === 429) {
        apiError.message = retryAfterSeconds !== null
          ? `Quotation limit reached (3 per minute). Please try again in ${formatRetryAfter(retryAfterSeconds)}.`
          : 'Quotation limit reached (3 per minute). Please wait before trying again.';
        return apiError;
      }

      apiError.message = axiosError.response.data?.error || 'An error occurred';
      return apiError;
    }

    if (axiosError.request) {
      apiError.message = 'Network error. Please check your connection.';
      apiError.status = 0;
      apiError.errors = null;
      apiError.retryAfterSeconds = null;
      return apiError;
    }
  }

  if (error instanceof Error) {
    apiError.message = error.message;
  }

  apiError.status = 500;
  apiError.errors = null;
  apiError.retryAfterSeconds = null;
  return apiError;
};

export const request = async <TResponse>({
  method,
  url,
  data,
}: {
  method: 'GET' | 'POST';
  url: string;
  data?: unknown;
}) => {
  try {
    const response = await api.request<TResponse>({ method, url, data });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
};
