import { createContext, useContext, type PropsWithChildren } from 'react';
import { useAuthStatus, type AuthStatusState } from '../../hooks/useAuthStatus';

const AuthContext = createContext<AuthStatusState | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const authState = useAuthStatus();

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return authContext;
};