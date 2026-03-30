import { useMutation } from '@tanstack/react-query';
import type { LoginCredentials, LoginResponse } from '../features/auth/types';
import type { QuotationPayload, QuotationResponse } from '../features/quotation/types';
import { calculateQuotation, login } from '../services/apiService';
import type { ApiError } from '../services/apiService';

export const useLoginMutation = () =>
  useMutation<LoginResponse, ApiError, LoginCredentials>({
    mutationFn: (credentials) => login(credentials),
  });

export const useQuotationMutation = () =>
  useMutation<QuotationResponse, ApiError, QuotationPayload>({
    mutationFn: (quotationData) => calculateQuotation(quotationData),
  });