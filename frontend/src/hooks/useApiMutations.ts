import { useMutation } from '@tanstack/react-query';
import type { LoginCredentials, LoginResponse } from '../features/auth/types';
import type { QuotationPayload, QuotationResponse } from '../features/quotation/types';
import { login } from '../services/authService';
import { calculateQuotation } from '../services/quotationService';
import type { ApiError } from '../services/apiClient';

export const useLoginMutation = () =>
  useMutation<LoginResponse, ApiError, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });

export const useQuotationMutation = () =>
  useMutation<QuotationResponse, ApiError, QuotationPayload>({
    mutationFn: (quotationData: QuotationPayload) => calculateQuotation(quotationData),
  });