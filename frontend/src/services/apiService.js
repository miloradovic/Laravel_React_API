import axios from 'axios';

const TOKEN_STORAGE_KEY = 'jwt_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

const toApiError = (error) => {
  const apiError = new Error('An unexpected error occurred');

  if (error.response) {
    apiError.message = error.response.data?.error || 'An error occurred';
    apiError.status = error.response.status;
    apiError.errors = error.response.data?.messages || null;
    return apiError;
  }

  if (error.request) {
    apiError.message = 'Network error. Please check your connection.';
    apiError.status = 0;
    apiError.errors = null;
    return apiError;
  }

  apiError.message = error.message || apiError.message;
  apiError.status = 500;
  apiError.errors = null;
  return apiError;
};

const request = async ({ method, url, data }) => {
  try {
    const response = await api.request({ method, url, data });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const login = async ({ email, password }) => {
  const response = await request({
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

export const calculateQuotation = (quotationData) =>
  request({
    method: 'POST',
    url: '/quotation',
    data: quotationData,
  });

export const getCurrencies = () =>
  request({
    method: 'GET',
    url: '/quotation/currencies',
  });

export const healthCheck = () => request({ method: 'GET', url: '/health' });

const apiService = {
  calculateQuotation,
  clearToken,
  getCurrencies,
  getToken,
  healthCheck,
  isAuthenticated,
  login,
  logout,
  setToken,
};

export default apiService;