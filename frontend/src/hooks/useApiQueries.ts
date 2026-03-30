import { useQuery } from '@tanstack/react-query';
import type { Currency } from '../features/quotation/types';
import { queryKeys } from '../shared/react-query/queryKeys';
import { getCurrencies } from '../services/apiService';

export const useCurrenciesQuery = (enabled = true) =>
  useQuery<Currency[]>({
    queryKey: queryKeys.currencies(),
    queryFn: async () => {
      const response = await getCurrencies();
      return response.currencies || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });