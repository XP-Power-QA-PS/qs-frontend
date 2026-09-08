import React, { useState, useEffect } from 'react';
import { Edit, Search, Plus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Role } from '../../types/admin.types';
import toast from 'react-hot-toast';
import { useViewMode } from '../../context/ViewModeContext';
import { ViewModeToggle } from '../../components/common/ViewModeToggle';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRoles(page, size);
      setRoles(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error: any) {
      toast.error('Failed to load roles: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createRole({
        name: form.name,
        description: form.description,
      });
      toast.success('Role added successfully');
      setIsAddOpen(false);
      setForm({ name: '', description: '' });
      loadRoles();
    } catch (error: any) {
      toast.error('Failed to add role: ' + (error.message || 'Unknown error'));
    }
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description });
    setIsEditOpen(true);
  };

  const [searchKeyword, setSearchKeyword] = useState('');
  const { viewMode } = useViewMode();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await adminService.updateRole(editingRole.id, {
        name: form.name,
        description: form.description
      });
      toast.success('Role updated successfully');
      setIsEditOpen(false);
      setEditingRole(null);
      loadRoles();
    } catch (error: any) {
      toast.error('Failed to update role: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto font-body-md">
      {/* Header & Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Role Management</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{totalElements} Total</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Manage system roles and permissions.</p>
            </div>
          </div>

          {/* Manual View Mode Switcher (Synchronized) */}
          <ViewModeToggle className="self-start sm:self-auto" />
        </div>

        {/* Search & Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by role name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-2xs"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors shadow-xs min-h-[42px] shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Role</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Cards vs Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <span className="material-symbols-outlined text-blue-600 text-[32px] animate-spin">progress_activity</span>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-base font-medium">No roles found</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for a different role name.</p>
          </div>
        ) : viewMode === 'card' ? (
          /* Cards View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3 sm:p-4">
            {filteredRoles.map((role) => {
              const isSystemRole = role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER';
              return (
                <div key={role.id} className="p-4 rounded-xl border border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {role.name.replace('ROLE_', '')}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{role.id}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-3">
                      {role.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-400">
                      {isSystemRole ? 'System Protected' : 'Custom Role'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!isSystemRole && (
                        <button
                          type="button"
                          onClick={() => openEdit(role)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View with Horizontal Scrolling */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">ROLE NAME</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{role.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {role.name.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {role.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        {role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER' ? (
                          <span className="text-xs text-gray-400 italic">System Protected</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEdit(role)}
                            className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && roles.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-gray-500 text-center sm:text-left">
              Showing <span className="font-semibold text-gray-900">{page * size + 1}</span> to <span className="font-semibold text-gray-900">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-gray-900">{totalElements}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-gray-700">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors min-h-[36px]"
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Role</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANAGER"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 bg-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  Create Role
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Role</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANAGER"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-gray-900 bg-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};