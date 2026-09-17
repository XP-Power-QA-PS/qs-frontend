import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  RotateCcw, 
  Save, 
  Search, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import type { 
  PermissionMatrixData, 
  PermissionModuleGroup, 
  PermissionItem,
  Role 
} from '@/types/admin';

export const PermissionMatrixPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [matrixData, setMatrixData] = useState<PermissionMatrixData | null>(null);
  
  // Current working state: roleId -> Set of permissionIds (as strings)
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, Set<string>>>({});
  // Baseline state to detect unsaved changes: roleId -> Set of permissionIds
  const [initialPermissions, setInitialPermissions] = useState<Record<string, Set<string>>>({});
  
  // Search query to filter permissions
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mobile role selector tab
  const [selectedMobileRoleId, setSelectedMobileRoleId] = useState<string>('');

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPermissionMatrix();
      setMatrixData(data);

      const mapped: Record<string, Set<string>> = {};
      if (data.rolePermissions) {
        Object.entries(data.rolePermissions).forEach(([roleId, permIds]) => {
          mapped[roleId] = new Set(permIds.map(String));
        });
      }
      setCurrentPermissions(mapped);
      setInitialPermissions(mapped);

      if (data.roles && data.roles.length > 0 && !selectedMobileRoleId) {
        setSelectedMobileRoleId(String(data.roles[0].id));
      }
    } catch (err: any) {
      console.error('Failed to load permission matrix', err);
      toast.error(err.message || 'Failed to load permission matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  // Compute number of unsaved changes
  const unsavedChangesCount = useMemo(() => {
    let count = 0;
    if (!matrixData) return 0;

    matrixData.roles.forEach((role) => {
      const roleId = String(role.id);
      const curr = currentPermissions[roleId] || new Set();
      const init = initialPermissions[roleId] || new Set();

      // Permissions added
      curr.forEach((permId) => {
        if (!init.has(permId)) count++;
      });
      // Permissions removed
      init.forEach((permId) => {
        if (!curr.has(permId)) count++;
      });
    });

    return count;
  }, [currentPermissions, initialPermissions, matrixData]);

  const hasUnsavedChanges = unsavedChangesCount > 0;

  // Toggle single permission for a role
  const handleToggle = (role: Role, permId: string) => {
    const roleId = String(role.id);
    if (role.name === 'ROLE_ADMIN') {
      toast('Super Admin retains full permissions for system stability', {
        icon: '🔒',
      });
      return;
    }

    setCurrentPermissions((prev) => {
      const rolePerms = new Set(prev[roleId] || []);
      if (rolePerms.has(permId)) {
        rolePerms.delete(permId);
      } else {
        rolePerms.add(permId);
      }
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
  };

  // Grant all permissions in a module to a role
  const handleGrantModule = (role: Role, moduleGroup: PermissionModuleGroup) => {
    const roleId = String(role.id);
    if (role.name === 'ROLE_ADMIN') return;

    setCurrentPermissions((prev) => {
      const rolePerms = new Set(prev[roleId] || []);
      moduleGroup.permissions.forEach((p: PermissionItem) => rolePerms.add(String(p.id)));
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
    toast.success(`Granted all ${moduleGroup.moduleName} permissions to ${role.name.replace('ROLE_', '')}`);
  };

  // Revoke all permissions in a module from a role
  const handleRevokeModule = (role: Role, moduleGroup: PermissionModuleGroup) => {
    const roleId = String(role.id);
    if (role.name === 'ROLE_ADMIN') return;

    setCurrentPermissions((prev) => {
      const rolePerms = new Set(prev[roleId] || []);
      moduleGroup.permissions.forEach((p: PermissionItem) => rolePerms.delete(String(p.id)));
      return {
        ...prev,
        [roleId]: rolePerms,
      };
    });
    toast.success(`Revoked ${moduleGroup.moduleName} permissions from ${role.name.replace('ROLE_', '')}`);
  };

  // Discard changes
  const handleDiscard = () => {
    setCurrentPermissions(initialPermissions);
    toast('Reverted unsaved modifications', { icon: '↩️' });
  };

  // Save changes
  const handleSave = async () => {
    if (!matrixData) return;

    try {
      setSaving(true);
      const payload: Record<string, string[]> = {};
      Object.entries(currentPermissions).forEach(([roleId, permSet]) => {
        payload[roleId] = Array.from(permSet);
      });

      const updated = await adminService.updatePermissionMatrix({ rolePermissions: payload });
      setMatrixData(updated);

      const mapped: Record<string, Set<string>> = {};
      if (updated.rolePermissions) {
        Object.entries(updated.rolePermissions).forEach(([roleId, permIds]) => {
          mapped[roleId] = new Set(permIds.map(String));
        });
      }
      setCurrentPermissions(mapped);
      setInitialPermissions(mapped);

      toast.success('Permission matrix saved successfully!');
    } catch (err: any) {
      console.error('Failed to save permission matrix', err);
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Role Badge Styling helper
  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return { label: 'Administrator', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'ROLE_SUPERVISOR':
        return { label: 'Supervisor', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ROLE_QC_ENGINEER':
        return { label: 'QC Engineer', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ROLE_INSPECTOR':
        return { label: 'QC Inspector', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'ROLE_OPERATOR':
        return { label: 'Operator', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'ROLE_USER':
        return { label: 'General User', badgeClass: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { label: roleName.replace('ROLE_', ''), badgeClass: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  // Filter modules and permissions based on search query
  const filteredModules = useMemo(() => {
    if (!matrixData) return [];
    if (!searchQuery.trim()) return matrixData.modules;

    const q = searchQuery.toLowerCase().trim();
    return matrixData.modules
      .map((mod) => {
        const matchesModule = mod.moduleName.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q);
        const filteredPerms = mod.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );

        if (matchesModule) return mod;
        if (filteredPerms.length > 0) {
          return {
            ...mod,
            permissions: filteredPerms,
          };
        }
        return null;
      })
      .filter(Boolean) as PermissionModuleGroup[];
  }, [matrixData, searchQuery]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64"></div>
        <div className="h-4 bg-slate-100 rounded w-96"></div>
        <div className="h-64 bg-slate-100 rounded-xl border border-border-subtle"></div>
        <div className="h-64 bg-slate-100 rounded-xl border border-border-subtle"></div>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className="p-8 text-center text-text-muted">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <p className="font-semibold">Unable to load permissions matrix.</p>
        <button
          onClick={fetchMatrix}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const selectedMobileRole = matrixData.roles.find((r) => String(r.id) === selectedMobileRoleId) || matrixData.roles[0];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-28">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary font-headline-lg">
              Team & Permissions Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              RBAC v2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Configure multi-tier role authorization, action clearances, and granular feature access across factory operations.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={fetchMatrix}
            title="Refresh matrix data"
            className="p-2 sm:px-3 sm:py-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg active:scale-98'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-xs font-medium text-text-muted">Total Roles</p>
          <p className="text-xl font-bold text-text-primary mt-1">{matrixData.roles.length}</p>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-xs font-medium text-text-muted">Quality Modules</p>
          <p className="text-xl font-bold text-primary mt-1">{matrixData.modules.length}</p>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-xs font-medium text-text-muted">Granular Authorities</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {matrixData.modules.reduce((acc, m) => acc + m.permissions.length, 0)}
          </p>
        </div>
        <div className="bg-surface-card p-4 rounded-xl border border-border-subtle shadow-2xs">
          <p className="text-xs font-medium text-text-muted">Unsaved Modifications</p>
          <p className={`text-xl font-bold mt-1 ${hasUnsavedChanges ? 'text-amber-600' : 'text-emerald-600'}`}>
            {hasUnsavedChanges ? `${unsavedChangesCount} changes` : 'Synchronized'}
          </p>
        </div>
      </div>

      {/* MOBILE ONLY: Role-First Segmented Selector (< 768px) */}
      <div className="md:hidden bg-surface-card p-3 rounded-xl border border-border-subtle shadow-xs space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Role to Configure:</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {matrixData.roles.map((role) => {
            const roleMeta = getRoleBadgeStyle(role.name);
            const isSelected = String(role.id) === selectedMobileRoleId;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedMobileRoleId(String(role.id))}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-subtle text-text-secondary hover:bg-slate-200'
                }`}
              >
                {role.name === 'ROLE_ADMIN' ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{roleMeta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE CARDS: Desktop Matrix Table & Mobile Cardified View */}
      {filteredModules.length === 0 ? (
        <div className="bg-surface-card p-12 text-center rounded-xl border border-border-subtle">
          <SlidersHorizontal className="w-10 h-10 mx-auto text-text-muted mb-2" />
          <p className="text-base font-medium text-text-primary">No matching permissions found</p>
          <p className="text-xs text-text-muted mt-1">Try clearing your search query "{searchQuery}"</p>
        </div>
      ) : (
        filteredModules.map((moduleGroup) => {
          return (
            <div
              key={moduleGroup.moduleKey}
              className="bg-surface-card rounded-xl border border-border-subtle shadow-xs overflow-hidden"
            >
              {/* Module Header Bar */}
              <div className="bg-surface-subtle/80 px-4 sm:px-5 py-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h2 className="font-headline-sm text-text-primary text-sm sm:text-base font-semibold">
                      {moduleGroup.moduleName}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 bg-white border border-border-subtle rounded-md text-text-muted font-technical-data font-medium">
                      {moduleGroup.permissions.length} actions
                    </span>
                  </div>
                  {moduleGroup.description && (
                    <p className="text-xs text-text-muted mt-0.5 sm:pl-4">{moduleGroup.description}</p>
                  )}
                </div>
              </div>

              {/* DESKTOP TABLE VIEW (md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-slate-50/50">
                      <th className="sticky left-0 bg-slate-50/90 backdrop-blur-xs w-52 sm:w-60 py-3 pl-5 pr-3 text-xs font-semibold text-text-muted uppercase tracking-wider border-r border-border-subtle/60 z-10">
                        Role / Persona
                      </th>
                      {moduleGroup.permissions.map((perm: PermissionItem) => (
                        <th
                          key={perm.id}
                          className="py-3 px-3 text-center text-xs font-semibold text-text-secondary min-w-[130px]"
                          title={perm.description || perm.name}
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className="text-text-primary font-medium text-[13px]">{perm.name}</span>
                            <span className="text-[10px] text-text-muted font-technical-data font-normal">
                              {perm.action}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {matrixData.roles.map((role) => {
                      const roleId = String(role.id);
                      const roleMeta = getRoleBadgeStyle(role.name);
                      const isSuperAdmin = role.name === 'ROLE_ADMIN';
                      const rolePermSet = currentPermissions[roleId] || new Set();

                      return (
                        <tr
                          key={role.id}
                          className="hover:bg-primary/[0.015] transition-colors group"
                        >
                          {/* Sticky Left Column: Role Details */}
                          <td className="sticky left-0 bg-surface-card group-hover:bg-slate-50/90 py-3.5 pl-5 pr-3 border-r border-border-subtle/70 z-10">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleMeta.badgeClass}`}
                              >
                                {roleMeta.label}
                              </span>
                              {isSuperAdmin && (
                                <span title="System Protected Role" className="text-slate-400">
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                              {role.description || role.name}
                            </p>
                          </td>

                          {/* Action Permission Columns */}
                          {moduleGroup.permissions.map((perm: PermissionItem) => {
                            const permId = String(perm.id);
                            const isGranted = isSuperAdmin || rolePermSet.has(permId);

                            return (
                              <td key={perm.id} className="py-3.5 px-3 text-center align-middle">
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(role, permId)}
                                    disabled={isSuperAdmin}
                                    title={
                                      isSuperAdmin
                                        ? 'System Protected: Admin permanently holds this permission'
                                        : `${isGranted ? 'Revoke' : 'Grant'} "${perm.name}" for ${roleMeta.label}`
                                    }
                                    className={`relative w-6 h-6 rounded-[5px] flex items-center justify-center transition-all cursor-pointer ${
                                      isSuperAdmin
                                        ? 'bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed'
                                        : isGranted
                                        ? 'bg-[#059669] hover:bg-emerald-700 border border-[#059669] text-white shadow-xs'
                                        : 'bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-primary/70'
                                    }`}
                                  >
                                    {isSuperAdmin ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : isGranted ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : null}
                                  </button>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDIFIED VIEW (Visible only on < 768px) */}
              <div className="md:hidden divide-y divide-border-subtle p-3 space-y-2">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-xs text-text-muted">
                    Configuring for: <strong className="text-text-primary">{getRoleBadgeStyle(selectedMobileRole.name).label}</strong>
                  </span>
                  {!['ROLE_ADMIN'].includes(selectedMobileRole.name) && (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => handleGrantModule(selectedMobileRole, moduleGroup)}
                        className="text-primary hover:underline font-medium"
                      >
                        Grant All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleRevokeModule(selectedMobileRole, moduleGroup)}
                        className="text-text-muted hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {moduleGroup.permissions.map((perm: PermissionItem) => {
                  const permId = String(perm.id);
                  const isSuperAdmin = selectedMobileRole.name === 'ROLE_ADMIN';
                  const isGranted =
                    isSuperAdmin || (currentPermissions[String(selectedMobileRole.id)] || new Set()).has(permId);

                  return (
                    <div
                      key={perm.id}
                      onClick={() => !isSuperAdmin && handleToggle(selectedMobileRole, permId)}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer min-h-[48px] ${
                        isGranted ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="pr-3">
                        <p className="text-sm font-medium text-text-primary">{perm.name}</p>
                        <p className="text-xs text-text-muted">{perm.description || perm.code}</p>
                      </div>

                      <div
                        className={`shrink-0 w-6 h-6 rounded-[5px] flex items-center justify-center transition-all ${
                          isSuperAdmin
                            ? 'bg-slate-100 border border-slate-300 text-slate-500'
                            : isGranted
                            ? 'bg-[#059669] border border-[#059669] text-white shadow-xs'
                            : 'bg-white border-2 border-slate-300'
                        }`}
                      >
                        {isGranted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* FLOATING ACTION BAR: Unsaved Modifications */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-xl w-full z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl px-5 py-3.5 shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                  You have {unsavedChangesCount} unsaved permission change{unsavedChangesCount > 1 ? 's' : ''}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Remember to save your changes to apply updates across active user sessions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
