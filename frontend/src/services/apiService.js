import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.token = localStorage.getItem('jwt_token');
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('jwt_token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: endpoint,
      };

      if (data) {
        config.data = data;
      }

      const response = await this.api.request(config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.messages || null,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 500,
      };
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('POST', '/auth/login', {
      email,
      password,
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  logout() {
    this.clearToken();
  }

  // Quotation methods
  async calculateQuotation(quotationData) {
    return await this.request('POST', '/quotation', quotationData);
  }

  // Health check
  async healthCheck() {
    return await this.request('GET', '/health');
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;