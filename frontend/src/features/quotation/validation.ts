import { z } from 'zod';
import type { Currency, QuotationPayload } from './types';

const AGE_PATTERN = /^(\d{1,2})(,\d{1,2})*$/;

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTodayDateInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60 * 1000;

  return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export const createQuotationSchema = (currencies: Currency[]) =>
  z
    .object({
      ages: z.string().trim().min(1, 'Ages are required'),
      currency_id: z.string().min(1, 'Currency is required'),
      start_date: z.string().min(1, 'Start date is required'),
      end_date: z.string().min(1, 'End date is required'),
    })
    .superRefine((values, ctx) => {
      if (!AGE_PATTERN.test(values.ages)) {
        ctx.addIssue({
          code: 'custom',
          path: ['ages'],
          message: 'Ages must be numbers separated by commas (e.g., "28,35")',
        });
      } else {
        const invalidAges = values.ages
          .split(',')
          .map((age) => Number.parseInt(age.trim(), 10))
          .filter((age) => age < 18 || age > 70);

        if (invalidAges.length > 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['ages'],
            message: 'All ages must be between 18 and 70',
          });
        }
      }

      if (!currencies.some((currency) => currency.code === values.currency_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['currency_id'],
          message: 'Please select a valid currency',
        });
      }

      const startDate = new Date(values.start_date);
      if (startDate < getStartOfToday()) {
        ctx.addIssue({
          code: 'custom',
          path: ['start_date'],
          message: 'Start date must be today or in the future',
        });
      }

      const endDate = new Date(values.end_date);
      if (endDate <= startDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: 'End date must be after start date',
        });
      }
    });

export type QuotationFormValues = z.infer<ReturnType<typeof createQuotationSchema>>;

export const toQuotationPayload = (formData: QuotationFormValues): QuotationPayload => ({
  age: formData.ages.trim(),
  currency_id: formData.currency_id,
  start_date: formData.start_date,
  end_date: formData.end_date,
});