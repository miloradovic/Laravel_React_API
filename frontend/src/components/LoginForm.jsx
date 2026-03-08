import { useState } from 'react';
import PropTypes from 'prop-types';
import { useLoginMutation } from '../hooks/useApiMutations';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: 'test@example.com', // Pre-filled for demo
    password: 'password'        // Pre-filled for demo
  });
  
  const [errors, setErrors] = useState({});
  const loginMutation = useLoginMutation();
  const loading = loginMutation.isPending;

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

    setErrors({});

    try {
      const response = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
      onLoginSuccess(response);
    } catch (error) {
      setErrors({
        general: error.message || 'Login failed. Please try again.'
      });
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Login</h2>
      
      {errors.general && (
        <div className="notice notice-error">
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
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="notice notice-neutral">
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