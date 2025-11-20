

import React from 'react';
import { Navigate } from 'react-router-dom';


function ProtectedRoute({ children }) {
  
  const user = localStorage.getItem('userInfo');

  
  if (!user) {
    
    return <Navigate to="/giris-yap" replace />;
  }

  
  return children;
}

export default ProtectedRoute;