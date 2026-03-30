import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { healthCheck, isAuthenticated as hasToken, logout as clearAuth } from '../services/apiService';

const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export interface AuthStatusState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  logout: () => void;
  markAuthenticated: () => void;
}

export const useAuthStatus = (): AuthStatusState => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const handleUnauthorized = useEffectEvent(() => {
    setIsAuthenticated(false);
  });

  const logout = useCallback(() => {
    clearAuth();
    setIsAuthenticated(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
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

    const handleUnauthorizedEvent = () => {
      if (!cancelled) {
        handleUnauthorized();
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorizedEvent);
    void checkAuth();

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorizedEvent);
    };
  }, [handleUnauthorized, logout]);

  return {
    isAuthenticated,
    isCheckingAuth,
    logout,
    markAuthenticated,
  };
};