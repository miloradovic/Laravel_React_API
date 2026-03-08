import { useCallback, useEffect, useState } from 'react';
import { healthCheck, isAuthenticated as hasToken, logout as clearAuth } from '../services/apiService';

const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const logout = useCallback(() => {
    clearAuth();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!hasToken()) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        await healthCheck();
        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false);
        }
      }
    };

    const handleUnauthorized = () => {
      if (!cancelled) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    checkAuth();

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout]);

  return {
    isAuthenticated,
    isCheckingAuth,
    logout,
    setIsAuthenticated,
  };
};
