import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { normalizeAuthUser } from '../utils/authUser.js';

const AuthContext = createContext(null);

const LEGACY_TOKEN_KEY = 'ttm_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('auth/logout');
    } catch {
      // ignore network errors; still clear local session
    } finally {
      try {
        localStorage.removeItem(LEGACY_TOKEN_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
    }
  }, []);

  const loadMe = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('auth/me');
      setUser(normalizeAuthUser(data.user));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          void logout();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const login = useCallback(async (email, password, accountType) => {
    const { data } = await api.post('auth/login', { email, password, accountType });
    setUser(normalizeAuthUser(data.user));
    return normalizeAuthUser(data.user);
  }, []);

  const signup = useCallback(async (payload) => {
    await api.post('auth/signup', payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshUser: loadMe,
    }),
    [user, loading, login, signup, logout, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
