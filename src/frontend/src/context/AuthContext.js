import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Auth Context oluştur
const AuthContext = createContext();

// Custom hook - AuthContext'i kullanmak için
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Component mount olduğunda localStorage'dan token ve user bilgilerini yükle
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Giriş yap fonksiyonu
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        
        // Token ve user bilgilerini state'e ve localStorage'a kaydet
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Giriş başarısız' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Giriş yapılırken bir hata oluştu';
      return { success: false, message: errorMessage };
    }
  };

  // Kayıt ol fonksiyonu
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return { success: true, message: 'Kayıt başarılı' };
      } else {
        return { success: false, message: response.message || 'Kayıt başarısız' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Kayıt olurken bir hata oluştu';
      return { success: false, message: errorMessage };
    }
  };

  // Çıkış yap fonksiyonu
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Kullanıcı giriş yapmış mı kontrolü
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

