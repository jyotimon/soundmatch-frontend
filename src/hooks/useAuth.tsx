'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe } from '@/lib/api';

interface AuthUser {
  user:    { id: string; display_name: string; avatar_url: string | null; email: string };
  profile: any | null;
}

interface AuthCtx {
  auth:     AuthUser | null;
  loading:  boolean;
  setToken: (token: string) => void;
  signOut:  () => void;
  refetch:  () => void;
}

const AuthContext = createContext<AuthCtx>({
  auth: null, loading: true,
  setToken: () => {}, signOut: () => {}, refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX: fetchMe only reads from localStorage.
  // Token capture from URL is handled exclusively by /auth/callback/page.tsx.
  // Doing it here too caused race conditions, wrong URL in browser bar,
  // and SSR crashes (window.location not available server-side).
  const fetchMe = async () => {
    const token = localStorage.getItem('sm_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      setAuth(data);
    } catch {
      // Token is invalid or expired — clear it and stay logged out
      localStorage.removeItem('sm_token');
      setAuth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  const setToken = (token: string) => {
    localStorage.setItem('sm_token', token);
    getMe().then(setAuth).catch(console.error);
  };

  const signOut = () => {
    localStorage.removeItem('sm_token');
    setAuth(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ auth, loading, setToken, signOut, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
