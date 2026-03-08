import PropTypes from 'prop-types';

const Results = ({ result, onNewQuotation, currencies }) => {
  if (!result) {
    return null;
  }

  const formatCurrency = (amount, currencyCode) => {
    const matchedCurrency = currencies.find((currency) => currency.code === currencyCode);
    const symbolOrCode = matchedCurrency?.symbol || currencyCode;

    return `${symbolOrCode} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }

    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const startDate = result.start_date || result.calculation_details?.start_date;
  const endDate = result.end_date || result.calculation_details?.end_date;

  return (
    <div className="result-card">
      <h3 className="result-title">
        Your Travel Insurance Quote
      </h3>

      <div className="result-total">
        {formatCurrency(result.total, result.currency_id)}
      </div>

      <div className="result-meta">
        Quotation ID: #{result.quotation_id}
      </div>

      <div className="result-section">
        <h4 className="result-section-title">Trip Details</h4>
        <div className="breakdown">
          <div className="breakdown-item">
            <span>Trip Length:</span>
            <span>{result.trip_length} days</span>
          </div>
          <div className="breakdown-item">
            <span>Start Date:</span>
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="breakdown-item">
            <span>End Date:</span>
            <span>{formatDate(endDate)}</span>
          </div>
          <div className="breakdown-item">
            <span>Currency:</span>
            <span>{result.currency_id}</span>
          </div>
        </div>
      </div>

      {result.breakdown && result.breakdown.length > 0 && (
        <div className="result-section">
          <h4 className="result-section-title">Pricing Breakdown</h4>
          <div className="breakdown">
            {result.breakdown.map((item, index) => (
              <div key={index} className="breakdown-item">
                <span>Age {item.age} (Load: {item.age_load})</span>
                <span>{formatCurrency(item.subtotal, result.currency_id)}</span>
              </div>
            ))}
            <div className="breakdown-item breakdown-item-total">
              <span><strong>Total Premium:</strong></span>
              <span><strong>{formatCurrency(result.total, result.currency_id)}</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="result-actions">
        <button
          onClick={onNewQuotation}
          className="btn btn-primary"
        >
          Get New Quotation
        </button>
      </div>

      <div className="notice notice-warning result-disclaimer">
        <strong>Important:</strong> This is a sample quotation for demonstration purposes only. 
        Actual insurance terms, conditions, and pricing may vary.
      </div>
    </div>
  );
};

Results.propTypes = {
  result: PropTypes.shape({
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    total: PropTypes.number.isRequired,
    currency_id: PropTypes.string.isRequired,
    quotation_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trip_length: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    calculation_details: PropTypes.shape({
      start_date: PropTypes.string,
      end_date: PropTypes.string,
    }),
    breakdown: PropTypes.arrayOf(
      PropTypes.shape({
        age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        age_load: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        subtotal: PropTypes.number.isRequired,
      })
    ),
  }),
  onNewQuotation: PropTypes.func.isRequired,
  currencies: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      symbol: PropTypes.string,
    })
  ),
};

Results.defaultProps = {
  currencies: [],
};

export default Results;