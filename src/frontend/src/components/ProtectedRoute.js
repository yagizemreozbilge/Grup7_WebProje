import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  clearStoredAuth,
  getStoredAuth,
  hasPermission,
  isTokenValid,
} from '../utils/auth';

const DEFAULT_ROLE_KEYWORDS = [];

const matchRoleKeywords = (roleDetails = [], keywords = DEFAULT_ROLE_KEYWORDS) => {
  if (!Array.isArray(roleDetails) || keywords.length === 0) return false;
  return roleDetails.some((role) => {
    const name = role.name?.toLowerCase() || '';
    return keywords.some((keyword) => name && name.includes(keyword));
  });
};

function ProtectedRoute({ children, requiredPermissions = [], allowedRoleKeywords = [] }) {
  const location = useLocation();
  const auth = getStoredAuth();

  if (!auth || !isTokenValid(auth.token)) {
    clearStoredAuth();
    return (
      <Navigate
        to="/giris-yap"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const hasRequiredPermission = hasPermission(auth.user, requiredPermissions);
  const hasAllowedRole = matchRoleKeywords(auth.user?.role_details, allowedRoleKeywords);

  if (!hasRequiredPermission && !hasAllowedRole) {
    return (
      <Navigate
        to="/"
        replace
        state={{ denied: true, from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;