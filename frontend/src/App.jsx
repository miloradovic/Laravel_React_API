import { useState } from 'react';
import LoginForm from './components/LoginForm';
import QuotationForm from './components/QuotationForm';
import Results from './components/Results';
import { useCurrenciesQuery } from './hooks/useApiQueries';
import { useAuthStatus } from './hooks/useAuthStatus';

function App() {
  const [quotationResult, setQuotationResult] = useState(null);
  const { isAuthenticated, isCheckingAuth, logout, setIsAuthenticated } = useAuthStatus();
  const {
    data: currencies = [],
    isLoading: isLoadingCurrencies,
    error: currenciesError,
  } = useCurrenciesQuery(isAuthenticated);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setQuotationResult(null);
  };

  const handleQuotationResult = (result) => {
    setQuotationResult(result);
  };

  const handleNewQuotation = () => {
    setQuotationResult(null);
  };

  const handleLogout = () => {
    logout();
    setQuotationResult(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="container">
        <div className="loading">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Travel Insurance Quotation System</h1>
        <p>Get instant quotes for your travel insurance needs</p>
        
        {isAuthenticated && (
          <div className="header-actions">
            <button onClick={handleLogout} className="btn btn-secondary btn-small">
              Logout
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {currenciesError && (
            <div className="notice notice-error">
              {currenciesError.message || 'Failed to load currencies.'}
            </div>
          )}

          {!quotationResult ? (
            <QuotationForm
              onQuotationResult={handleQuotationResult}
              currencies={currencies}
              currenciesLoading={isLoadingCurrencies}
            />
          ) : (
            <Results 
              result={quotationResult} 
              onNewQuotation={handleNewQuotation}
              currencies={currencies}
            />
          )}
        </>
      )}

      <footer className="app-footer">
        <p>Travel Insurance Quotation Demo System</p>
        <p>Built with Laravel 12 + React 19 + Vite</p>
      </footer>
    </div>
  );
}

export default App;