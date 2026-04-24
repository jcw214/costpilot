'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, getStoredAuth, clearStoredAuth } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setUser(getStoredAuth());
    setLoading(false);
  };

  const signOut = () => {
    clearStoredAuth();
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
