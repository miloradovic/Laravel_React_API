import type { Currency } from './types';

const displayDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const formatCurrencyAmount = (
  amount: number,
  currencyCode: string,
  currencies: Currency[] = [],
) => {
  const matchedCurrency = currencies.find((currency) => currency.code === currencyCode);
  const symbolOrCode = matchedCurrency?.symbol || currencyCode;

  return `${symbolOrCode} ${amount.toFixed(2)}`;
};

export const formatDisplayDate = (dateString?: string) => {
  if (!dateString) {
    return 'N/A';
  }

  return displayDateFormatter.format(new Date(dateString));
};