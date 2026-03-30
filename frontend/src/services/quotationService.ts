import type { CurrenciesResponse, QuotationPayload, QuotationResponse } from '../features/quotation/types';
import { request } from './apiClient';

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
