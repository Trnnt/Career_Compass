import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
