import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('scamshield_token') || sessionStorage.getItem('scamshield_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('scamshield_user') || sessionStorage.getItem('scamshield_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Validate session against backend on mount
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          const storage = localStorage.getItem('scamshield_token') ? localStorage : sessionStorage;
          storage.setItem('scamshield_user', JSON.stringify(userData));
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn("Backend not reachable, maintaining offline session:", err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email, password, rememberMe = false) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: rememberMe })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to authenticate');
    }

    const { access_token, user: userData } = data;
    setToken(access_token);
    setUser(userData);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('scamshield_token', access_token);
    storage.setItem('scamshield_user', JSON.stringify(userData));

    // Clear the other storage to avoid conflicts
    if (rememberMe) {
      sessionStorage.removeItem('scamshield_token');
      sessionStorage.removeItem('scamshield_user');
    } else {
      localStorage.removeItem('scamshield_token');
      localStorage.removeItem('scamshield_user');
    }

    return userData;
  };

  const register = async ({ full_name, email, password, confirm_password }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirm_password })
    });

    const data = await res.json();
    if (!res.ok) {
      if (Array.isArray(data.detail)) {
        throw new Error(data.detail[0].msg || 'Validation error');
      }
      throw new Error(data.detail || 'Registration failed');
    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('scamshield_token');
    localStorage.removeItem('scamshield_user');
    sessionStorage.removeItem('scamshield_token');
    sessionStorage.removeItem('scamshield_user');
  };

  const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  };

  const resetPassword = async (token, new_password, confirm_password) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password, confirm_password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Password reset failed');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        apiBase: API_BASE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
