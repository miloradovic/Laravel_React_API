import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import QuotationForm from './components/QuotationForm';
import Results from './components/Results';
import apiService from './services/apiService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [quotationResult, setQuotationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          // Test the token by making a health check request
          await apiService.healthCheck();
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          apiService.clearToken();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (response) => {
    console.log('Login successful:', response);
    setIsAuthenticated(true);
    setQuotationResult(null); // Clear any previous results
  };

  const handleQuotationResult = (result) => {
    console.log('Quotation result:', result);
    setQuotationResult(result);
  };

  const handleNewQuotation = () => {
    setQuotationResult(null);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setQuotationResult(null);
  };

  if (loading) {
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
          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={handleLogout}
              className="btn"
              style={{ 
                backgroundColor: '#6b7280', 
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {!quotationResult ? (
            <QuotationForm onQuotationResult={handleQuotationResult} />
          ) : (
            <Results 
              result={quotationResult} 
              onNewQuotation={handleNewQuotation} 
            />
          )}
        </>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px', 
        color: '#6b7280', 
        fontSize: '14px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p>Travel Insurance Quotation Demo System</p>
        <p>Built with Laravel 12 + React 19 + Vite</p>
      </div>
    </div>
  );
}

export default App;