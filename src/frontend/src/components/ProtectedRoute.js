import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected Route Component
// Bu component, sadece giriş yapmış kullanıcıların erişebileceği sayfaları korur
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Yükleniyor durumunda bekle
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  if (!isAuthenticated()) {
    return <Navigate to="/giris-yap" replace />;
  }

  // Kullanıcı giriş yapmışsa sayfayı göster
  return children;
};

export default ProtectedRoute;

