import { startTransition, useState } from 'react';
import QuotationForm from '../../../components/QuotationForm';
import Results from '../../../components/Results';
import type { QuotationResponse } from '../types';
import { useCurrenciesQuery } from '../../../hooks/useApiQueries';
import { useCircuitBreaker } from '../../../hooks/useCircuitBreaker';
import styles from './QuotationPage.module.css';

const QuotationPage = () => {
  const [quotationResult, setQuotationResult] = useState<QuotationResponse | null>(null);
  const {
    data: currencies = [],
    isLoading: isLoadingCurrencies,
    error: currenciesError,
  } = useCurrenciesQuery(true);

  const { circuitState } = useCircuitBreaker();

  const handleQuotationResult = (result: QuotationResponse) => {
    startTransition(() => {
      setQuotationResult(result);
    });
  };

  const handleNewQuotation = () => {
    startTransition(() => {
      setQuotationResult(null);
    });
  };

  return (
    <>
      {currenciesError && (
        <div className={styles.errorNotice} role="alert">
          {currenciesError.message || 'Failed to load currencies.'}
        </div>
      )}

      {!quotationResult ? (
        <QuotationForm
          onQuotationResult={handleQuotationResult}
          currencies={currencies}
          currenciesLoading={isLoadingCurrencies}
          circuitState={circuitState}
        />
      ) : (
        <Results result={quotationResult} onNewQuotation={handleNewQuotation} currencies={currencies} />
      )}
    </>
  );
};

export default QuotationPage;