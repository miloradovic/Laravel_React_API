import React, { useState } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/apiService';

const QuotationForm = ({ onQuotationResult }) => {
  const [formData, setFormData] = useState({
    ages: '',
    currency_id: 'EUR',
    start_date: '',
    end_date: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'USD', name: 'US Dollar ($)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Age validation
    if (!formData.ages.trim()) {
      newErrors.ages = 'Ages are required';
    } else {
      const agePattern = /^(\d{1,2})(,\d{1,2})*$/;
      if (!agePattern.test(formData.ages.trim())) {
        newErrors.ages = 'Ages must be numbers separated by commas (e.g., "28,35")';
      } else {
        const ages = formData.ages.split(',').map(age => parseInt(age.trim()));
        const invalidAges = ages.filter(age => age < 18 || age > 70);
        if (invalidAges.length > 0) {
          newErrors.ages = 'All ages must be between 18 and 70';
        }
      }
    }

    // Currency validation
    if (!formData.currency_id) {
      newErrors.currency_id = 'Currency is required';
    }

    // Start date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        newErrors.start_date = 'Start date must be today or in the future';
      }
    }

    // End date validation
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const quotationData = {
        age: formData.ages.trim(),
        currency_id: formData.currency_id,
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      const response = await apiService.calculateQuotation(quotationData);
      console.log('Quotation calculated:', response);
      onQuotationResult(response);
    } catch (error) {
      console.error('Quotation calculation failed:', error);
      setErrors({
        general: error.message || 'Failed to calculate quotation. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="card quotation-card">
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
        Travel Insurance Quotation
      </h2>
      
      {errors.general && (
        <div style={{ 
          color: '#dc2626', 
          backgroundColor: '#fef2f2', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="quotation-form">
        <div className="form-group">
          <label htmlFor="ages" className="form-label">
            Traveler Ages
          </label>
          <input
            type="text"
            id="ages"
            name="ages"
            value={formData.ages}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter ages separated by commas (e.g., 28,35)"
            disabled={loading}
          />
          {errors.ages && <div className="error">{errors.ages}</div>}
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Ages must be between 18-70. For multiple travelers, separate with commas.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="currency_id" className="form-label">
            Currency
          </label>
          <select
            id="currency_id"
            name="currency_id"
            value={formData.currency_id}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
          {errors.currency_id && <div className="error">{errors.currency_id}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="start_date" className="form-label">
            Trip Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="form-input"
            min={getTodayDate()}
            disabled={loading}
          />
          {errors.start_date && <div className="error">{errors.start_date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="end_date" className="form-label">
            Trip End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="form-input"
            min={formData.start_date || getTodayDate()}
            disabled={loading}
          />
          {errors.end_date && <div className="error">{errors.end_date}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Get Quotation'}
        </button>
      </form>
    </div>
  );
};

QuotationForm.propTypes = {
  onQuotationResult: PropTypes.func.isRequired,
};

export default QuotationForm;