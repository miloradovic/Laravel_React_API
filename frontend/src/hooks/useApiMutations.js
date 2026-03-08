import { useMutation } from '@tanstack/react-query';
import { calculateQuotation, login } from '../services/apiService';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: ({ email, password }) => login({ email, password }),
  });

export const useQuotationMutation = () =>
  useMutation({
    mutationFn: (quotationData) => calculateQuotation(quotationData),
  });
