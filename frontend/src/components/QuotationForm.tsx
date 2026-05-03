import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Currency, QuotationResponse } from '../features/quotation/types';
import {
  createQuotationSchema,
  getTodayDateInputValue,
  toQuotationPayload,
  type QuotationFormValues,
} from '../features/quotation/validation';
import { useQuotationMutation } from '../hooks/useApiMutations';
import styles from './QuotationForm.module.css';

interface QuotationFormProps {
  onQuotationResult: (result: QuotationResponse) => void;
  currencies: Currency[];
  currenciesLoading?: boolean;
}

const QuotationForm = ({
  onQuotationResult,
  currencies,
  currenciesLoading = false,
}: QuotationFormProps) => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const quotationMutation = useQuotationMutation();
  const loading = quotationMutation.isPending;
  const todayDate = getTodayDateInputValue();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(createQuotationSchema(currencies)),
    defaultValues: {
      ages: '',
      currency_id: '',
      start_date: '',
      end_date: '',
    },
  });

  const watchedAges = watch('ages');
  const watchedCurrency = watch('currency_id');
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  const agesField = register('ages');
  const currencyField = register('currency_id');
  const startDateField = register('start_date');
  const endDateField = register('end_date');
  const agesErrorId = errors.ages ? 'quotation-ages-error' : undefined;
  const currencyErrorId = errors.currency_id ? 'quotation-currency-error' : undefined;
  const startDateErrorId = errors.start_date ? 'quotation-start-date-error' : undefined;
  const endDateErrorId = errors.end_date ? 'quotation-end-date-error' : undefined;
  const agesHelpId = 'quotation-ages-help';

  useEffect(() => {
    setGeneralError((previousError) => (previousError ? null : previousError));
  }, [watchedAges, watchedCurrency, watchedStartDate, watchedEndDate]);

  useEffect(() => {
    if (!currencies.length || getValues('currency_id')) {
      return;
    }

    setValue('currency_id', currencies[0].code, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [currencies, getValues, setValue]);

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      setGeneralError(null);
      const response = await quotationMutation.mutateAsync(toQuotationPayload(values));
      onQuotationResult(response);
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : 'Failed to calculate quotation. Please try again.',
      );
    }
  });

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Travel Insurance Quotation</h2>

      {generalError && (
        <div className={styles.noticeError} role="alert">
          {generalError}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="ages" className={styles.formLabel}>
            Traveler Ages
          </label>
          <input
            type="text"
            id="ages"
            className={styles.formInput}
            placeholder="Enter ages separated by commas (e.g., 28,35)"
            inputMode="numeric"
            aria-invalid={Boolean(errors.ages)}
            aria-describedby={[agesHelpId, agesErrorId].filter(Boolean).join(' ') || undefined}
            disabled={loading}
            {...agesField}
          />
          {errors.ages && (
            <div className={styles.error} id={agesErrorId}>
              {errors.ages.message}
            </div>
          )}
          <div className={styles.formHelpText} id={agesHelpId}>
            Ages must be between 18-70. For multiple travelers, separate with commas.
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="currency_id" className={styles.formLabel}>
            Currency
          </label>
          <select
            id="currency_id"
            className={styles.formSelect}
            aria-invalid={Boolean(errors.currency_id)}
            aria-describedby={currencyErrorId}
            disabled={loading || currenciesLoading || currencies.length === 0}
            {...currencyField}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
          {errors.currency_id && (
            <div className={styles.error} id={currencyErrorId}>
              {errors.currency_id.message}
            </div>
          )}
          {!currenciesLoading && currencies.length === 0 && (
            <div className={styles.error}>No currencies are currently available.</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="start_date" className={styles.formLabel}>
            Trip Start Date
          </label>
          <input
            type="date"
            id="start_date"
            className={styles.formInput}
            min={todayDate}
            aria-invalid={Boolean(errors.start_date)}
            aria-describedby={startDateErrorId}
            disabled={loading}
            {...startDateField}
          />
          {errors.start_date && (
            <div className={styles.error} id={startDateErrorId}>
              {errors.start_date.message}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="end_date" className={styles.formLabel}>
            Trip End Date
          </label>
          <input
            type="date"
            id="end_date"
            className={styles.formInput}
            min={watchedStartDate || todayDate}
            aria-invalid={Boolean(errors.end_date)}
            aria-describedby={endDateErrorId}
            disabled={loading}
            {...endDateField}
          />
          {errors.end_date && (
            <div className={styles.error} id={endDateErrorId}>
              {errors.end_date.message}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || currenciesLoading || currencies.length === 0}
        >
          {loading ? 'Calculating...' : 'Get Quotation'}
        </button>
      </form>
    </div>
  );
};

export default QuotationForm;