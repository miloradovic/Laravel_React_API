import { describe, expect, it } from 'vitest';
import { createQuotationSchema, getTodayDateInputValue } from './validation';

const currencies = [{ code: 'EUR', name: 'Euro', symbol: 'EUR' }];

const getFutureDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];
};

describe('createQuotationSchema', () => {
  it('accepts valid quotation values', () => {
    const result = createQuotationSchema(currencies).safeParse({
      ages: '28,35',
      currency_id: 'EUR',
      start_date: getTodayDateInputValue(),
      end_date: getFutureDate(7),
    });

    expect(result.success).toBe(true);
  });

  it('rejects a past start date', () => {
    const result = createQuotationSchema(currencies).safeParse({
      ages: '28',
      currency_id: 'EUR',
      start_date: getFutureDate(-1),
      end_date: getFutureDate(7),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.start_date).toContain(
        'Start date must be today or in the future',
      );
    }
  });
});