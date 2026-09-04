import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Search, Plus, ChevronDown, Check } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { User } from '../../types/admin.types';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
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
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'ROLE_USER', status: 'Active' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = currentTab === 'Active' 
        ? await adminService.getUsers(page, size, statusFilter, searchKeyword) 
        : await adminService.getDeletedUsers(page, size);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
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
    try {
      await adminService.createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        roles: [form.role]
      });
      toast.success('User added successfully');
      setIsAddOpen(false);
      setForm({ username: '', email: '', password: '', role: 'ROLE_USER', status: 'Active' });
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to add user: ' + (error.message || 'Unknown error'));
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
      email: user.email, 
      password: '', 
      role: user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_USER',
      status: user.enabled ? 'Active' : 'Inactive'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      // NOTE: Assume adminService.updateUser is implemented
      await adminService.updateUser(editingUser.id, {
        username: form.username,
        email: form.email,
        roles: [form.role],
        isEnabled: form.status === 'Active',
        ...(form.password ? { password: form.password } : {})
      });
      toast.success('User updated successfully');
      setIsEditOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error('Failed to update user: ' + (error.message || 'Unknown error'));
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

  return (
    <div className="p-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">User Account Registry</h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{totalElements} Total</span>
            </div>
            <p className="text-sm text-gray-500">Manage administrative status, credentials, and details.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${currentTab === 'Active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setCurrentTab('Active')}
          >
            Active Users
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${currentTab === 'Trash' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setCurrentTab('Trash')}
          >
            Trash Bin
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              placeholder="Filter by ID, email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              onBlur={() => setTimeout(() => setIsStatusDropdownOpen(false), 150)}
              className="flex items-center justify-between w-[130px] bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-[#003366] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>{statusFilter}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-20 py-1">
                {['All Status', 'Active', 'Inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm transition-colors ${statusFilter === status
                      ? 'bg-gray-100 text-[#003366]'
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
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium text-sm transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add New Account
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ACCOUNT MEMBER</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ROLE</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PHONE NUMBER</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CREATED DATE</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                          {getInitial(user)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{getName(user)}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.roles.map(r => (
                        <span key={r} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mr-1">
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {user.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.phoneNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        {currentTab === 'Active' ? (
                          <>
                            <button className="p-1.5 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                            <button type="button" onClick={() => openEdit(user)} className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-md transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDelete(user.id.toString())} className="p-1.5 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors" title="Move to Trash"><Trash2 className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => handleRestore(user.id.toString())} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">Restore</button>
                            <button type="button" onClick={() => handlePermanentDelete(user.id.toString())} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{page * size + 1}</span> to <span className="font-medium">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-medium">{totalElements}</span> results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Account</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_USER">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Leave empty for default '123456'"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Create Account
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Account</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_USER">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Update Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};







