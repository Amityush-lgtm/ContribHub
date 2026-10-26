import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('contribhub_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Authenticated fetch wrapper
  const apiFetch = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const activeToken = token || localStorage.getItem('contribhub_token');
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'omit' // or 'include'
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }

      return data;
    },
    [token]
  );

  // Verify current user on mount or token change
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('contribhub_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem('contribhub_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Error checking auth state:', err);
      // Keep state if temporary network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login action
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('contribhub_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('contribhub_token');
      setToken(null);
      setUser(null);
    }
  };

  // Update local profile state
  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        logout,
        refreshUser,
        apiFetch,
        isAuthenticated: !!user,
        role: user?.role
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
