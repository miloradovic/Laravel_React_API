export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export interface QuotationCalculationDetails {
  start_date?: string;
  end_date?: string;
}

export interface QuotationBreakdownItem {
  age: string | number;
  age_load: string | number;
  subtotal: number;
}

export interface QuotationPayload {
  age: string;
  currency_id: string;
  start_date: string;
  end_date: string;
}

export interface QuotationResponse {
  start_date?: string;
  end_date?: string;
  total: number;
  currency_id: string;
  quotation_id: string | number;
  trip_length: string | number;
  calculation_details?: QuotationCalculationDetails;
  breakdown?: QuotationBreakdownItem[];
}

export interface CurrenciesResponse {
  currencies: Currency[];
}