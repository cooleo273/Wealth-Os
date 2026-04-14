'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@wealth/types';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken, isTokenExpired } from '@/lib/auth';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function tryRefresh(): Promise<string | null> {
    try {
      const data = await api.post<{ accessToken: string }>('/auth/refresh');
      return data.accessToken;
    } catch {
      return null;
    }
  }

  async function fetchUser(accessToken: string) {
    const profile = await api.get<UserProfile>('/users/me', accessToken);
    setUser(profile);
  }

  useEffect(() => {
    async function init() {
      let tok = getToken();
      if (!tok || isTokenExpired(tok)) {
        tok = await tryRefresh();
      }
      if (tok) {
        setToken(tok);
        setTokenState(tok);
        try {
          await fetchUser(tok);
        } catch {
          clearToken();
          setTokenState(null);
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ accessToken: string }>('/auth/login', {
      email,
      password,
    });
    setToken(data.accessToken);
    setTokenState(data.accessToken);
    await fetchUser(data.accessToken);
  }

  async function logout() {
    try {
      await api.post('/auth/logout', undefined, token ?? undefined);
    } finally {
      clearToken();
      setTokenState(null);
      setUser(null);
    }
  }

  async function refreshUser() {
    if (!token) return;
    await fetchUser(token);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
