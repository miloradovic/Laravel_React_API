import { formatCurrencyAmount, formatDisplayDate } from '../features/quotation/formatters';
import type { Currency, QuotationResponse } from '../features/quotation/types';
import styles from './Results.module.css';

interface ResultsProps {
  result: QuotationResponse | null;
  onNewQuotation: () => void;
  currencies?: Currency[];
}

const Results = ({ result, onNewQuotation, currencies = [] }: ResultsProps) => {
  if (!result) {
    return null;
  }

  const startDate = result.start_date || result.calculation_details?.start_date;
  const endDate = result.end_date || result.calculation_details?.end_date;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Your Travel Insurance Quote</h3>

      <div className={styles.total}>
        {formatCurrencyAmount(result.total, result.currency_id, currencies)}
      </div>

      <div className={styles.meta}>Quotation ID: #{result.quotation_id}</div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Trip Details</h4>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span>Trip Length:</span>
            <span>{result.trip_length} days</span>
          </div>
          <div className={styles.breakdownItem}>
            <span>Start Date:</span>
            <span>{formatDisplayDate(startDate)}</span>
          </div>
          <div className={styles.breakdownItem}>
            <span>End Date:</span>
            <span>{formatDisplayDate(endDate)}</span>
          </div>
          <div className={styles.breakdownItem}>
            <span>Currency:</span>
            <span>{result.currency_id}</span>
          </div>
        </div>
      </div>

      {result.breakdown && result.breakdown.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Pricing Breakdown</h4>
          <div className={styles.breakdown}>
            {result.breakdown.map((item) => (
              <div key={`${item.age}-${item.subtotal}`} className={styles.breakdownItem}>
                <span>
                  Age {item.age} (Load: {item.age_load})
                </span>
                <span>{formatCurrencyAmount(item.subtotal, result.currency_id, currencies)}</span>
              </div>
            ))}
            <div className={`${styles.breakdownItem} ${styles.breakdownItemTotal}`}>
              <span>
                <strong>Total Premium:</strong>
              </span>
              <span>
                <strong>{formatCurrencyAmount(result.total, result.currency_id, currencies)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={onNewQuotation} className={styles.actionButton}>
          Get New Quotation
        </button>
      </div>

      <div className={styles.disclaimer}>
        <strong>Important:</strong> This is a sample quotation for demonstration purposes only. Actual
        insurance terms, conditions, and pricing may vary.
      </div>
    </div>
  );
};

export default Results;