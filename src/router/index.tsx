import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { RoleManagementPage } from '@/pages/admin/RoleManagementPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { EquipmentListPage } from '@/pages/gonogo/EquipmentListPage';
import { EquipmentHistoryPage } from '@/pages/gonogo/EquipmentHistoryPage';
import { EquipmentTestDetailPage } from '@/pages/gonogo/EquipmentTestDetailPage';
import { EquipmentDayComparisonPage } from '@/pages/gonogo/EquipmentDayComparisonPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/admin/users',
            element: <UserManagementPage />,
          },
          {
            path: '/admin/roles',
            element: <RoleManagementPage />,
          },
          {
            path: '/equipments',
            element: <EquipmentListPage />,
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
            path: '/equipments/:equipmentId/records/:recordId/compare',
            element: <EquipmentDayComparisonPage />,
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
