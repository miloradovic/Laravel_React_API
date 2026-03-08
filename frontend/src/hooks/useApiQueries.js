import { useQuery } from '@tanstack/react-query';
import { getCurrencies } from '../services/apiService';

export const useCurrenciesQuery = (enabled = true) =>
  useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await getCurrencies();
      return response.currencies || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
