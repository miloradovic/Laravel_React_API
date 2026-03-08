import React, { useState } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/apiService';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: 'test@example.com', // Pre-filled for demo
    password: 'password'        // Pre-filled for demo
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await apiService.login(formData.email, formData.password);
      console.log('Login successful:', response);
      onLoginSuccess(response);
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({
        general: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Login</h2>
      
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your email"
            disabled={loading}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            disabled={loading}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '4px', 
        fontSize: '14px' 
      }}>
        <strong>Demo Credentials:</strong><br />
        Email: test@example.com<br />
        Password: password
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginForm;