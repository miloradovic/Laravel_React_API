import { useCallback, useEffect, useRef, useState } from 'react';
import { healthCheck } from '../services/healthService';
import { isAuthenticated as hasToken } from '../services/apiClient';
import { logout as clearAuth } from '../services/authService';

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
  const setIsAuthenticatedRef = useRef(setIsAuthenticated);

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
        setIsAuthenticatedRef.current(false);
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorizedEvent);
    void checkAuth();

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorizedEvent);
    };
  }, [logout]);

  return {
    isAuthenticated,
    isCheckingAuth,
    logout,
    markAuthenticated,
  };
};