import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { UserManagement } from '@/pages/admin/UserManagement';
import { RoleManagement } from '@/pages/admin/RoleManagement';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { EquipmentPage } from '@/pages/EquipmentPage';
import { EquipmentHistoryPage } from '@/pages/EquipmentHistoryPage';
import { EquipmentTestDetailPage } from '@/pages/EquipmentTestDetailPage';

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
            path: '/equipments',
            element: <EquipmentPage />,
          },
          {
            path: '/equipments/:equipmentId/history',
            element: <EquipmentHistoryPage />,
          },
          {
            path: '/equipments/:equipmentId/records/:recordId/daily',
            element: <EquipmentTestDetailPage />,
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
