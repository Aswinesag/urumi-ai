import { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface AuthContextType {
  apiKey: string | null;
  isAuthenticated: boolean;
  setApiKey: (key: string | null) => void;
  clearApiKey: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    if (key) {
      apiClient.setApiKey(key);
    } else {
      apiClient.clearApiKey();
    }
  };

  const clearApiKey = () => {
    setApiKeyState(null);
    apiClient.clearApiKey();
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        isAuthenticated: apiKey !== null,
        setApiKey,
        clearApiKey,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
