import { request } from './apiClient';

export const healthCheck = () => request({ method: 'GET', url: '/health' });
