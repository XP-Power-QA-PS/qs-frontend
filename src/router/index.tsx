import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UserDashboardPage } from '@/pages/dashboard/UserDashboardPage';
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { RoleManagementPage } from '@/pages/admin/RoleManagementPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { EquipmentListPage } from '@/pages/gonogo/EquipmentListPage';
import { EquipmentHistoryPage } from '@/pages/gonogo/EquipmentHistoryPage';
import { EquipmentTestDetailPage } from '@/pages/gonogo/EquipmentTestDetailPage';
import { EquipmentDayComparisonPage } from '@/pages/gonogo/EquipmentDayComparisonPage';
import { GoNoGoStatisticsPage } from '@/pages/gonogo/GoNoGoStatisticsPage';
import { EquipmentAnalyticsPage } from '@/pages/gonogo/EquipmentAnalyticsPage';

export interface BreadcrumbCrumbResult {
  label: string;
  path?: string;
}

export interface BreadcrumbContext {
  params: Record<string, string | undefined>;
  searchParams: URLSearchParams;
  location: { pathname: string; search: string };
}

export interface BreadcrumbHandle {
  crumb?: (ctx: BreadcrumbContext) => BreadcrumbCrumbResult | string | null | undefined;
}

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
            element: <UserDashboardPage />,
          },
          {
            path: '/admin/dashboard',
            element: <AdminDashboardPage />,
            handle: {
              crumb: () => ({ label: 'Admin Dashboard', path: '/admin/dashboard' }),
            } satisfies BreadcrumbHandle,
          },
          {
            path: '/admin/users',
            element: <UserManagementPage />,
            handle: {
              crumb: () => ({ label: 'User Management', path: '/admin/users' }),
            } satisfies BreadcrumbHandle,
          },
          {
            path: '/admin/roles',
            element: <RoleManagementPage />,
            handle: {
              crumb: () => ({ label: 'Role Management', path: '/admin/roles' }),
            } satisfies BreadcrumbHandle,
          },
          {
            path: '/equipments',
            element: <Outlet />,
            handle: {
              crumb: ({ searchParams }) => {
                const floorName = searchParams.get('floorName');
                const floorId = searchParams.get('floorId');
                return {
                  label: floorName ? `Check ${floorName}` : 'Equipments',
                  path: floorName && floorId
                    ? `/equipments?floorId=${floorId}&floorName=${encodeURIComponent(floorName)}`
                    : '/equipments',
                };
              },
            } satisfies BreadcrumbHandle,
            children: [
              {
                index: true,
                element: <EquipmentListPage />,
              },
              {
                path: ':equipmentId',
                element: <Outlet />,
                handle: {
                  crumb: ({ params, searchParams }) => {
                    const code = searchParams.get('code');
                    const floorId = searchParams.get('floorId');
                    const floorName = searchParams.get('floorName');
                    const name = searchParams.get('name');
                    const query = new URLSearchParams();
                    if (code) query.set('code', code);
                    if (name) query.set('name', name);
                    if (floorId) query.set('floorId', floorId);
                    if (floorName) query.set('floorName', floorName);
                    const qs = query.toString() ? `?${query.toString()}` : '';
                    return {
                      label: code || 'Equipment',
                      path: `/equipments/${params.equipmentId}/history${qs}`,
                    };
                  },
                } satisfies BreadcrumbHandle,
                children: [
                  {
                    path: 'history',
                    element: <EquipmentHistoryPage />,
                  },
                  {
                    path: 'analytics',
                    element: <EquipmentAnalyticsPage />,
                    handle: {
                      crumb: () => ({ label: 'Analytics' }),
                    } satisfies BreadcrumbHandle,
                  },
                  {
                    path: 'records/:recordId/daily',
                    element: <EquipmentTestDetailPage />,
                    handle: {
                      crumb: () => ({ label: 'Daily Details' }),
                    } satisfies BreadcrumbHandle,
                  },
                  {
                    path: 'records/:recordId/compare',
                    element: <EquipmentDayComparisonPage />,
                    handle: {
                      crumb: () => ({ label: 'Day Comparison' }),
                    } satisfies BreadcrumbHandle,
                  },
                ],
              },
            ],
          },
          {
            path: '/stats',
            element: <Outlet />,
            handle: {
              crumb: () => ({ label: 'Statistics', path: '/stats' }),
            } satisfies BreadcrumbHandle,
            children: [
              {
                index: true,
                element: <GoNoGoStatisticsPage />,
              },
              {
                path: 'equipment/:equipmentId',
                element: <EquipmentAnalyticsPage />,
                handle: {
                  crumb: ({ searchParams }) => ({
                    label: searchParams.get('code') || searchParams.get('name') || 'Equipment Analytics',
                  }),
                } satisfies BreadcrumbHandle,
              },
            ],
          },
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
