import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, Lock } from 'lucide-react';
import { adminService } from '@/services/admin';
import type { Role } from '@/types/admin';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
} from '@/components/common/table';

export const RoleManagementPage: React.FC = () => {
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
      setRoles(data.content || []);
      setTotalPages(data.page?.totalPages ?? (data as any).totalPages ?? 0);
      setTotalElements(data.page?.totalElements ?? (data as any).totalElements ?? 0);
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
    setForm({ name: role.name.replace('ROLE_', ''), description: role.description || '' });
    setIsEditOpen(true);
  };

  const [searchKeyword, setSearchKeyword] = useState('');
  const { viewMode } = useViewMode();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    const isSystemRole = editingRole.name === 'ROLE_ADMIN' || editingRole.name === 'ROLE_USER';
    try {
      await adminService.updateRole(editingRole.id, {
        name: isSystemRole ? editingRole.name : form.name,
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

  const handleDelete = async (id: string | number, roleName: string) => {
    if (roleName === 'ROLE_ADMIN' || roleName === 'ROLE_USER') {
      toast.error('Cannot delete system-protected roles');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role "${roleName.replace('ROLE_', '')}"?`)) {
      return;
    }
    try {
      await adminService.deleteRole(id);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error: any) {
      toast.error('Failed to delete role: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 font-body-md">
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
      {loading ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden py-20 flex justify-center items-center">
          <span className="material-symbols-outlined text-blue-600 text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden py-16 text-center text-gray-500">
          <p className="text-base font-medium">No roles found</p>
          <p className="text-xs text-gray-400 mt-1">Try searching for a different role name.</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Cards View Mode - Standalone cards directly on the background */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                      <button
                        type="button"
                        onClick={() => openEdit(role)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-canvas rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                        title="Edit Role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isSystemRole ? (
                        <button
                          type="button"
                          disabled
                          className="p-1.5 text-text-muted/30 cursor-not-allowed rounded-lg min-h-[34px] min-w-[34px] flex items-center justify-center"
                          title="System roles cannot be deleted"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(role.id, role.name)}
                          className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer for Card Mode */}
          {roles.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
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
      ) : (
        /* Table View with Horizontal Scrolling */
        <TableContainer>
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="w-1/3">ROLE NAME</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead align="right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableEmptyRow colSpan={4} message="No roles found." />
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium text-text-secondary">#{role.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {role.name.replace('ROLE_', '')}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-secondary">{role.description || '-'}</TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(role)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-canvas rounded-lg transition-colors cursor-pointer"
                          title="Edit role"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER' ? (
                          <button
                            type="button"
                            disabled
                            className="p-1.5 text-text-muted/30 cursor-not-allowed rounded-lg"
                            title="System roles cannot be deleted"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(role.id, role.name)}
                            className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {!loading && roles.length > 0 && (
            <div className="px-4 sm:px-6 py-3.5 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm bg-white">
              <span className="text-text-secondary text-center sm:text-left">
                Showing <span className="font-semibold text-text-primary">{page * size + 1}</span> to <span className="font-semibold text-text-primary">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-semibold text-text-primary">{totalElements}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-border-subtle rounded-xl text-xs font-medium text-text-secondary hover:bg-surface-canvas disabled:opacity-40 transition-colors min-h-[34px] cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2 font-medium text-text-secondary text-xs">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 border border-border-subtle rounded-xl text-xs font-medium text-text-secondary hover:bg-surface-canvas disabled:opacity-40 transition-colors min-h-[34px] cursor-pointer"
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Role</h2>
              {editingRole && (editingRole.name === 'ROLE_ADMIN' || editingRole.name === 'ROLE_USER') && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-muted border border-border-subtle">
                  <Lock className="w-3 h-3" /> System Role
                </span>
              )}
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                  {editingRole && (editingRole.name === 'ROLE_ADMIN' || editingRole.name === 'ROLE_USER') && (
                    <span className="text-xs text-text-muted font-normal ml-1">(System role cannot be renamed)</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  disabled={editingRole ? (editingRole.name === 'ROLE_ADMIN' || editingRole.name === 'ROLE_USER') : false}
                  placeholder="e.g. MANAGER"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none uppercase text-gray-900 ${
                    editingRole && (editingRole.name === 'ROLE_ADMIN' || editingRole.name === 'ROLE_USER')
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white focus:ring-2 focus:ring-blue-500'
                  }`}
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm cursor-pointer shadow-2xs"
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

export const RoleManagement = RoleManagementPage;