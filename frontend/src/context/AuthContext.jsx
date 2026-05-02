import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const getRoleRedirect = (role) => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'hr_officer': return '/hr/dashboard';
    case 'payroll_officer': return '/payroll/dashboard';
    case 'employee': return '/dashboard';
    default: return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('empay_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('empay_token');
      const savedUser = localStorage.getItem('empay_user');
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('empay_user', JSON.stringify(res.data.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('empay_token', newToken);
    localStorage.setItem('empay_user', JSON.stringify(userData));
    return getRoleRedirect(userData.role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('empay_token');
    localStorage.removeItem('empay_user');
  };

  const updateUser = (data) => {
    setUser(data);
    localStorage.setItem('empay_user', JSON.stringify(data));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, updateUser, getRoleRedirect }}>
      {children}
    </AuthContext.Provider>
  );
};
