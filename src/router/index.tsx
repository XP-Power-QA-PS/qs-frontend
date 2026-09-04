import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { RoleManagement } from '@/pages/admin/RoleManagement';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/admin/users',
            element: <UserManagement />,
          },
          {
            path: '/admin/roles',
            element: <RoleManagement />,
          },
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          }
        ]
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  }
]);
