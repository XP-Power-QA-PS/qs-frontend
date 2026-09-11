import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UserCheck,
  KeyRound,
  Trash2,
  ArrowLeft,
  UserPlus,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminService } from '@/services/admin';
import { authService } from '@/services/auth';
import type { User, Role } from '@/types/admin';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = authService.getUserRole() === 'ROLE_ADMIN';

  // Route guard: only administrators can view this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deletedCount, setDeletedCount] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes, deletedRes] = await Promise.allSettled([
          adminService.getUsers(0, 5),
          adminService.getRoles(0, 10),
          adminService.getDeletedUsers(0, 10),
        ]);

        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.content || []);
          setTotalUsers(usersRes.value.page?.totalElements ?? (usersRes.value as any).totalElements ?? (usersRes.value.content || []).length);
        }
        if (rolesRes.status === 'fulfilled') {
          setRoles(rolesRes.value.content || []);
        }
        if (deletedRes.status === 'fulfilled') {
          setDeletedCount(deletedRes.value.page?.totalElements ?? (deletedRes.value as any).totalElements ?? (deletedRes.value.content || []).length);
        }
      } catch (err: any) {
        toast.error('Failed to load administration overview');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  const activeUsersCount = users.filter((u) => u.enabled).length;

  return (
    <div className="w-full font-body-md">
      <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-border-subtle pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 shrink-0">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                    Administration Dashboard
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-technical-data font-semibold text-xs rounded-lg border border-emerald-500/20">
                    ROLE_ADMIN
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  System access control, user privileges, security policy and platform governance.
                </p>
              </div>
            </div>

            {/* 🔄 Switcher Button: Back to Operations Portal */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-card hover:bg-surface-subtle text-text-primary hover:text-primary border border-border-subtle hover:border-primary/40 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all duration-200 cursor-pointer shrink-0 self-start sm:self-auto"
              title="Return to Operations Portal"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
              <span>Operations Portal</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ── KPI Stat Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => navigate('/admin/users')}
                className="bg-surface-card p-4 sm:p-5 rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Users</span>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-technical-data text-text-primary">{totalUsers}</p>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                  <span>Manage operator accounts</span>
                  <ArrowRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div className="bg-surface-card p-4 sm:p-5 rounded-xl border border-border-subtle shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Active Users</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-technical-data text-emerald-600">{activeUsersCount}</p>
                <p className="text-xs text-text-secondary mt-1">Ready for floor assignments</p>
              </div>

              <div
                onClick={() => navigate('/admin/roles')}
                className="bg-surface-card p-4 sm:p-5 rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-violet-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Defined Roles</span>
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 group-hover:bg-violet-100 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-technical-data text-text-primary">{roles.length}</p>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                  <span>Configure permissions</span>
                  <ArrowRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div
                onClick={() => navigate('/admin/users')}
                className="bg-surface-card p-4 sm:p-5 rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-rose-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">In Trash</span>
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-technical-data text-rose-600">{deletedCount}</p>
                <p className="text-xs text-text-secondary mt-1">Pending permanent removal</p>
              </div>
            </div>

            {/* ── Quick Actions Grid ────────────────────────────────────────── */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center space-x-2">
                <span className="w-1.5 h-5 sm:h-6 bg-emerald-600 rounded-full" />
                <span>Administration Shortcuts</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div
                  onClick={() => navigate('/admin/users')}
                  className="p-4 bg-surface-card rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-primary cursor-pointer transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                      User Management
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Provision new accounts, reset passwords and assign technician roles.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/admin/roles')}
                  className="p-4 bg-surface-card rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-violet-400 cursor-pointer transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-violet-600 transition-colors">
                      Role Management
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Manage system roles, granular API permissions and feature flags.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/dashboard')}
                  className="p-4 bg-surface-card rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-emerald-600 transition-colors">
                      Operations Portal
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Inspect Go/No-Go floor testing progress, equipment analytics and statistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Recent Users Preview ──────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center space-x-2">
                  <span className="w-1.5 h-5 sm:h-6 bg-primary rounded-full" />
                  <span>Recent Accounts Overview</span>
                </h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View all users</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-surface-card rounded-xl border border-border-subtle shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-subtle text-text-muted text-xs font-semibold uppercase tracking-wider border-b border-border-subtle">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                            No user accounts found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-surface-subtle/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary leading-tight">{user.username}</p>
                                  <p className="text-[11px] text-text-muted">
                                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-text-secondary text-xs">{user.email || '—'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-text-primary text-xs font-medium border border-border-subtle">
                                {user.roles?.join(', ') || 'ROLE_USER'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {user.enabled ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-surface-subtle px-2 py-0.5 rounded-md border border-border-subtle">
                                  <XCircle className="w-3 h-3" />
                                  <span>Inactive</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => navigate('/admin/users')}
                                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
