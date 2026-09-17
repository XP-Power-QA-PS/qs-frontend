import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, ChevronDown, Check, KeyRound } from 'lucide-react';
import { adminService } from '@/services/admin';
import type { User } from '@/types/admin';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/common/table';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';

export interface RoleOption {
  value: string;
  label: string;
  badgeClass: string;
  requiresEmail: boolean;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'ROLE_OPERATOR', label: 'Operator (Công nhân)', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', requiresEmail: false, description: 'Thao tác chuyền, nhập Go/No-Go (Không bắt buộc email)' },
  { value: 'ROLE_INSPECTOR', label: 'QC Inspector (Kiểm định viên)', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200', requiresEmail: true, description: 'Kiểm tra chất lượng linh kiện, ký xác nhận lô (Cần email)' },
  { value: 'ROLE_QC_ENGINEER', label: 'QC Engineer (Kỹ sư chất lượng)', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', requiresEmail: true, description: 'Xử lý lỗi kỹ thuật, phân tích dữ liệu & khiếu nại (Cần email)' },
  { value: 'ROLE_SUPERVISOR', label: 'Supervisor (Tổ trưởng / Giám sát)', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', requiresEmail: true, description: 'Giám sát ca sản xuất, duyệt bỏ qua lỗi (Cần email)' },
  { value: 'ROLE_ADMIN', label: 'Administrator (Quản trị viên)', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200', requiresEmail: true, description: 'Quản trị hệ thống toàn quyền (Cần email)' },
  { value: 'ROLE_USER', label: 'General User (Người dùng thường)', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200', requiresEmail: true, description: 'Tài khoản tiêu chuẩn (Cần email)' }
];

export const getRoleOption = (role: string): RoleOption => {
  return ROLE_OPTIONS.find(r => r.value === role) || {
    value: role,
    label: role.replace('ROLE_', ''),
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    requiresEmail: true,
    description: ''
  };
};

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'Active' | 'Trash'>('Active');

  // Filter State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'ROLE_OPERATOR', status: 'Active' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = currentTab === 'Active'
        ? await adminService.getUsers(page, size, statusFilter, searchKeyword)
        : await adminService.getDeletedUsers(page, size);
      setUsers(data.content || []);
      setTotalPages(data.page?.totalPages ?? (data as any).totalPages ?? 0);
      setTotalElements(data.page?.totalElements ?? (data as any).totalElements ?? 0);
    } catch (error: any) {
      toast.error('Failed to load users: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [statusFilter, searchKeyword, currentTab]);

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter, searchKeyword, currentTab]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleOpt = getRoleOption(form.role);
    if (roleOpt.requiresEmail && (!form.email || !form.email.trim())) {
      toast.error(`Vai trò ${roleOpt.label} bắt buộc phải có địa chỉ Email!`);
      return;
    }
    try {
      await adminService.createUser({
        username: form.username.trim(),
        email: form.email.trim() || undefined,
        password: form.password || undefined,
        roles: [form.role]
      });
      toast.success('Thêm tài khoản thành công');
      setIsAddOpen(false);
      setForm({ username: '', email: '', password: '', role: 'ROLE_OPERATOR', status: 'Active' });
      loadUsers();
    } catch (error: any) {
      toast.error('Không thể thêm tài khoản: ' + (error.message || 'Unknown error'));
    }
  };

  const getInitial = (user: User) => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    return user.username.charAt(0).toUpperCase();
  };

  const getName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username;
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email || '',
      password: '',
      role: user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_OPERATOR',
      status: user.enabled ? 'Active' : 'Inactive'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const roleOpt = getRoleOption(form.role);
    if (roleOpt.requiresEmail && (!form.email || !form.email.trim())) {
      toast.error(`Vai trò ${roleOpt.label} bắt buộc phải có địa chỉ Email!`);
      return;
    }
    try {
      await adminService.updateUser(editingUser.id, {
        username: form.username.trim(),
        email: form.email.trim() || '',
        roles: [form.role],
        isEnabled: form.status === 'Active',
        ...(form.password ? { password: form.password } : {})
      });
      toast.success('Cập nhật tài khoản thành công');
      setIsEditOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error('Không thể cập nhật tài khoản: ' + (error.message || 'Unknown error'));
    }
  };

  const handleResetPasswordToDefault = async (user: User) => {
    if (!window.confirm(`Bạn có chắc muốn đặt lại mật khẩu của tài khoản "@${user.username}" về mặc định (123456)?`)) {
      return;
    }
    try {
      await adminService.updateUser(user.id, {
        email: user.email || '',
        password: '123456',
        isEnabled: user.enabled,
        roles: user.roles
      });
      toast.success(`Đã reset mật khẩu của @${user.username} về mặc định "123456"`);
    } catch (error: any) {
      toast.error('Không thể đặt lại mật khẩu: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to move this user to trash?')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User moved to trash');
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await adminService.restoreUser(id);
      toast.success('User restored successfully');
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to restore user: ' + (error.message || 'Unknown error'));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('WARNING: This will permanently anonymize this user and delete their profile. This action CANNOT be undone! Are you sure?')) return;
    try {
      await adminService.permanentlyDeleteUser(id);
      toast.success('User permanently deleted');
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to permanently delete user: ' + (error.message || 'Unknown error'));
    }
  };

  const { viewMode } = useViewMode();

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 font-body-md">
      {/* Header & Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top bar: Title + Tab Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">User Account Registry</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{totalElements} Total</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Manage administrative status, credentials, and details.</p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${currentTab === 'Active' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setCurrentTab('Active')}
              >
                Active Users
              </button>
              <button
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${currentTab === 'Trash' ? 'bg-white text-red-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setCurrentTab('Trash')}
              >
                Trash Bin
              </button>
            </div>

            {/* Manual View Mode Switcher (Synchronized) */}
            <div className="hidden sm:block">
              <ViewModeToggle />
            </div>
          </div>
        </div>

        {/* Action & Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by ID, email, username..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-2xs"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 150)}
                  className="flex items-center justify-between w-full sm:w-[140px] bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs min-h-[40px]"
                >
                  <span>{statusFilter}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30 py-1">
                    {['All Status', 'Active', 'Inactive'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === status
                          ? 'bg-gray-100 text-[#003366] font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="w-4 flex justify-center">
                          {statusFilter === status && <Check className="h-4 w-4" />}
                        </div>
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile View Switcher */}
              <div className="sm:hidden">
                <ViewModeToggle />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors shadow-xs min-h-[42px] shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Account</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Cards vs Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden py-20 flex justify-center items-center">
          <span className="material-symbols-outlined text-blue-600 text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden py-16 text-center text-gray-500">
          <p className="text-base font-medium">No users found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Cards Directory View (Mobile Optimized) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {users.map((user) => (
              <div key={user.id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 border border-blue-100">
                        {getInitial(user)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{getName(user)}</h3>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${user.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                    <p className="truncate">
                      <strong>Email:</strong> {user.email ? (
                        <span className="text-gray-900">{user.email}</span>
                      ) : (
                        <span className="text-gray-400 italic">Chưa có email (Công nhân)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-gray-700">Roles:</strong>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => {
                          const opt = getRoleOption(role);
                          return (
                            <span key={role} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${opt.badgeClass}`}>
                              {opt.label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-xs">Chưa có vai trò</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  {currentTab === 'Active' ? (
                    <>
                      <button
                        onClick={() => handleResetPasswordToDefault(user)}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Reset mật khẩu về mặc định (123456)"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(user)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(user.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors min-h-[38px]"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(user.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors min-h-[38px]"
                      >
                        Permanent Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer for Card Mode */}
          {users.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-gray-500 text-center sm:text-left">
                Showing <span className="font-semibold text-gray-900">{page * size + 1}</span> to <span className="font-semibold text-gray-900">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-gray-900">{totalElements}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
                >
                  Previous
                </button>
                <span className="px-2 font-medium text-gray-700">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View with Horizontal Scrolling */
        <TableContainer>
          <Table minWidth="750px">
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV / ID</TableHead>
                <TableHead>Họ & Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} clickable={false}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold px-2 py-1 bg-surface-subtle border border-border-subtle rounded-md text-primary inline-flex items-center gap-1">
                      <span className="text-gray-400 text-[10px]">#</span>{user.username}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20 text-xs">
                        {getInitial(user)}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{getName(user)}</div>
                        <div className="text-[11px] text-text-muted">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary text-xs">
                    {user.email ? (
                      user.email
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-gray-100 text-gray-500 italic">
                        Không có email
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => {
                          const opt = getRoleOption(role);
                          return (
                            <span key={role} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${opt.badgeClass}`}>
                              {opt.label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-text-muted text-xs">Chưa có vai trò</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-surface-subtle text-text-muted border border-border-subtle'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                      {user.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-secondary text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      {currentTab === 'Active' ? (
                        <>
                          <button
                            onClick={() => handleResetPasswordToDefault(user)}
                            className="p-1.5 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset mật khẩu về mặc định (123456)"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-canvas rounded-lg transition-colors cursor-pointer"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(user.id)}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                            title="Restore user"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(user.id)}
                            className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200"
                            title="Permanently delete user"
                          >
                            Perm Delete
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>

          {/* Pagination Footer */}
          {!loading && users.length > 0 && (
            <div className="px-4 sm:px-6 py-3.5 border-t border-border-subtle bg-surface-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-gray-500 text-center sm:text-left">
                Showing <span className="font-semibold text-gray-900">{page * size + 1}</span> to <span className="font-semibold text-gray-900">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-gray-900">{totalElements}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
                >
                  Previous
                </button>
                <span className="px-2 font-medium text-gray-700">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </TableContainer>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Thêm Tài Khoản Mới</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: OP-10492 hoặc john.doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role) *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{getRoleOption(form.role).description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getRoleOption(form.role).requiresEmail ? (
                    <>Email <span className="text-red-500">* (Bắt buộc cho vai trò này)</span></>
                  ) : (
                    <>Email <span className="text-gray-400 font-normal">(Không bắt buộc với công nhân)</span></>
                  )}
                </label>
                <input
                  type="email"
                  required={getRoleOption(form.role).requiresEmail}
                  placeholder={getRoleOption(form.role).requiresEmail ? "name@xppower.com" : "Để trống nếu là công nhân trực tiếp"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  placeholder="Mặc định là '123456' nếu để trống"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Chỉnh Sửa Tài Khoản</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên / Username *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role) *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{getRoleOption(form.role).description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getRoleOption(form.role).requiresEmail ? (
                    <>Email <span className="text-red-500">* (Bắt buộc cho vai trò này)</span></>
                  ) : (
                    <>Email <span className="text-gray-400 font-normal">(Không bắt buộc với công nhân)</span></>
                  )}
                </label>
                <input
                  type="email"
                  required={getRoleOption(form.role).requiresEmail}
                  placeholder={getRoleOption(form.role).requiresEmail ? "name@xppower.com" : "Để trống nếu là công nhân trực tiếp"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái (Status) *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active (Hoạt động)</option>
                  <option value="Inactive">Inactive (Khóa)</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, password: '123456' }))}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Gán mật khẩu mặc định (123456)
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Cập Nhật Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const UserManagement = UserManagementPage;