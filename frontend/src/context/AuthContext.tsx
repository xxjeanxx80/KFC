import React, { useState, useEffect } from 'react';
import { enhancedApi } from '../services/enhanced-api';
import type { User } from '../types';
import { AuthContext } from './useAuth';
import { STORAGE_KEYS } from '../config';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    if (token) {
      enhancedApi.setAuthToken(token);
    } else {
      enhancedApi.removeAuthToken();
    }
  }, [token]);

  // Listen for auth logout event (dispatched by interceptor when 401 occurs)
  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    enhancedApi.setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    enhancedApi.removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!(user && token) }}>
      {children}
    </AuthContext.Provider>
  );
};
