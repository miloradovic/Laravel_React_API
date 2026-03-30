import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { LoginCredentials, LoginResponse } from '../features/auth/types';
import type { CurrenciesResponse, QuotationPayload, QuotationResponse } from '../features/quotation/types';

const TOKEN_STORAGE_KEY = 'jwt_token';

export interface ApiError extends Error {
  status: number;
  errors: unknown;
}

const api = axios.create({
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

const toApiError = (error: unknown): ApiError => {
  const apiError = new Error('An unexpected error occurred') as ApiError;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; messages?: unknown }>;

    if (axiosError.response) {
      apiError.message = axiosError.response.data?.error || 'An error occurred';
      apiError.status = axiosError.response.status;
      apiError.errors = axiosError.response.data?.messages || null;
      return apiError;
    }

    if (axiosError.request) {
      apiError.message = 'Network error. Please check your connection.';
      apiError.status = 0;
      apiError.errors = null;
      return apiError;
    }
  }

  if (error instanceof Error) {
    apiError.message = error.message;
  }

  apiError.status = 500;
  apiError.errors = null;
  return apiError;
};

const request = async <TResponse>({
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

export const login = async ({ email, password }: LoginCredentials) => {
  const response = await request<LoginResponse>({
    method: 'POST',
    url: '/auth/login',
    data: { email, password },
  });

  if (response.access_token) {
    setToken(response.access_token);
  }

  return response;
};

export const logout = () => {
  clearToken();
};

export const calculateQuotation = (quotationData: QuotationPayload) =>
  request<QuotationResponse>({
    method: 'POST',
    url: '/quotation',
    data: quotationData,
  });

export const getCurrencies = () =>
  request<CurrenciesResponse>({
    method: 'GET',
    url: '/quotation/currencies',
  });

export const healthCheck = () => request({ method: 'GET', url: '/health' });