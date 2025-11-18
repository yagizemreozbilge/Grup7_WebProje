// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

// Bu bileşen, içine aldığı sayfayı (children) korur
function ProtectedRoute({ children }) {
  // 1. Hafızaya bak: Kullanıcı var mı?
  const user = localStorage.getItem('userInfo');

  // 2. Eğer kullanıcı YOKSA:
  if (!user) {
    // Onu nazikçe Giriş sayfasına postala
    return <Navigate to="/giris-yap" replace />;
  }

  // 3. Eğer kullanıcı VARSA:
  // Sayfayı (children) göster
  return children;
}

export default ProtectedRoute;