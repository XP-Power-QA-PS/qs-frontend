import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

export const AdminRoute: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.hasRole('ROLE_ADMIN');

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      toast.error('Bạn không có quyền truy cập khu vực quản trị (Yêu cầu quyền Administrator).');
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
