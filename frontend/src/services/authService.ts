import type { LoginCredentials, LoginResponse } from '../features/auth/types';
import { request, setToken, clearToken } from './apiClient';

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
