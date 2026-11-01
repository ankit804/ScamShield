import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE, apiFetch } from '../utils/apiClient';

const AuthContext = createContext();

function clearLegacyAuthStorage() {
  try {
    localStorage.removeItem('scamshield_token');
    localStorage.removeItem('scamshield_user');
  } catch { /* storage can be unavailable */ }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('scamshield_token') || null; } catch { return null; }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    apiFetch('/auth/logout', { method: 'POST', token }).catch(() => {});
    setToken(null);
    setUser(null);
    clearLegacyAuthStorage();
    try { sessionStorage.removeItem('scamshield_token'); } catch { /* storage can be unavailable */ }
  }, [token]);

  useEffect(() => {
    let active = true;
    clearLegacyAuthStorage();
    if (!API_BASE) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return () => { active = false; };
    }
    apiFetch('/auth/me', { token })
      .then(async response => {
        if (!response.ok) throw new Error('Session expired. Please sign in again.');
        const currentUser = await response.json();
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (!active) return;
        setToken(null);
        setUser(null);
        try { sessionStorage.removeItem('scamshield_token'); } catch { /* storage can be unavailable */ }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: rememberMe })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(data.detail) ? data.detail.map(item => item.msg).join(' ') : data.detail || 'Failed to authenticate');
    const { access_token, user: userData } = data;
    setToken(access_token || null);
    setUser(userData);
    clearLegacyAuthStorage();
    try {
      if (access_token) sessionStorage.setItem('scamshield_token', access_token);
    } catch { /* the HttpOnly session cookie remains available */ }
    return userData;
  };

  const register = async ({ full_name, email, password, confirm_password }) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirm_password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(data.detail) ? data.detail.map(item => item.msg).join(' ') : data.detail || 'Registration failed');
    return data;
  };

  const requestPasswordReset = async (email) => {
    const res = await apiFetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(data.detail) ? data.detail.map(item => item.msg).join(' ') : data.detail || 'Could not request a password reset.');
    return data;
  };

  const resetPassword = async (resetToken, new_password, confirm_password) => {
    const res = await apiFetch('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, new_password, confirm_password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Array.isArray(data.detail) ? data.detail.map(item => item.msg).join(' ') : data.detail || 'Password reset failed');
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      login, register, logout, requestPasswordReset, resetPassword, apiBase: API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
