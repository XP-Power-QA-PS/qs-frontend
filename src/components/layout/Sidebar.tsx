import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  Activity,
  ChevronDown,
  X,
  ChevronLeft,
  Mail,
  FileSpreadsheet,
  Layers,
  SlidersHorizontal,
  KeyRound,
} from 'lucide-react';
import { authService } from '@/services/auth';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Role & permission evaluation
  const userRoles = authService.getUserRoles();
  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const isOperatorOnly = userRoles.includes('ROLE_OPERATOR') && !userRoles.some((r) => r !== 'ROLE_OPERATOR');

  // Customer Complaints (CAPA): Visible to Admin, Supervisor, QC Engineer, Inspector, General User (Hidden for pure Operator)
  const canAccessComplaints =
    authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_QC_ENGINEER', 'ROLE_INSPECTOR', 'ROLE_USER']) &&
    !isOperatorOnly;

  // CFT Meetings & Email: Visible to Admin, Supervisor, QC Engineer
  const canAccessMeetings = authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_QC_ENGINEER']);

  // Statistics: Visible to Admin, Supervisor, QC Engineer, Inspector
  const canAccessStats = authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_QC_ENGINEER', 'ROLE_INSPECTOR']);

  // Operations & Floor Management: Admin only (backend @PreAuthorize('hasRole("ADMIN")'))
  const canAccessFloors = isAdmin;

  // Team & Permissions (Bottom section): Admin only
  const canAccessTeam = isAdmin;

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';
  const dashboardTitle = isAdmin ? 'Admin Dashboard' : 'Dashboard';

  const isTeamRoute =
    location.pathname.startsWith('/admin/users') ||
    location.pathname.startsWith('/admin/roles') ||
    location.pathname.startsWith('/admin/permissions');
  const isManagementRoute = location.pathname.startsWith('/admin/floors');
  const isStatsRoute = location.pathname.startsWith('/stats');

  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_group_stats');
    if (saved !== null) return saved === 'true';
    return true; // Default expanded
  });

  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_group_management');
    if (saved !== null) return saved === 'true';
    return true; // Default expanded
  });

  const [isTeamOpen, setIsTeamOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_group_team');
    if (saved !== null) return saved === 'true';
    return true; // Default expanded
  });

  const [activeFlyout, setActiveFlyout] = useState<'stats' | 'management' | 'team' | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setActiveFlyout(null);
      }
    };
    if (activeFlyout) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFlyout]);

  // Reset flyout state when expanding/collapsing sidebar
  useEffect(() => {
    setActiveFlyout(null);
  }, [isCollapsed]);

  useEffect(() => {
    if (isStatsRoute) {
      setIsStatsOpen(true);
    }
  }, [isStatsRoute]);

  useEffect(() => {
    if (isManagementRoute) {
      setIsManagementOpen(true);
    }
  }, [isManagementRoute]);

  useEffect(() => {
    if (isTeamRoute) {
      setIsTeamOpen(true);
    }
  }, [isTeamRoute]);

  const toggleStats = () => {
    setIsStatsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_group_stats', String(next));
      return next;
    });
  };

  const toggleManagement = () => {
    setIsManagementOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_group_management', String(next));
      return next;
    });
  };

  const toggleTeam = () => {
    setIsTeamOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_group_team', String(next));
      return next;
    });
  };

  // Sub-items for Statistics (extensible for future reporting modules)
  const statsSubItems = canAccessStats
    ? [{ name: 'GO/NOGO', path: '/stats', icon: Activity }]
    : [];

  // Sub-items for Operations & Management
  const managementSubItems = canAccessFloors
    ? [{ name: 'Manage Floors', path: '/admin/floors', icon: Layers }]
    : [];

  // Sub-items for Team & Permissions (Bottom Section)
  const teamSubItems = canAccessTeam
    ? [
        { name: 'User Directory', path: '/admin/users', icon: Users },
        { name: 'Role Management', path: '/admin/roles', icon: ShieldCheck },
        { name: 'Permissions Matrix', path: '/admin/permissions', icon: SlidersHorizontal },
      ]
    : [];

  const checkDashboardActive = (isActive: boolean) => {
    if (isActive) return true;
    if (!isAdmin && (location.pathname === '/dashboard' || location.pathname.startsWith('/equipments'))) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      <div
        onClick={onMobileClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      />

      {/* Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-2xl md:shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Header / Logo */}
        <div
          className={`flex items-center px-4 py-4 border-b border-border-subtle md:border-b-0 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            onClick={() => {
              navigate(dashboardPath);
              onMobileClose?.();
            }}
            className="flex items-center gap-1.5 cursor-pointer overflow-hidden whitespace-nowrap"
            title={`Go to ${dashboardTitle}`}
          >
            <span className="text-3xl font-extrabold text-black tracking-tighter">XP</span>
            {!isCollapsed && (
              <span className="text-2xl font-extrabold text-primary tracking-tighter transition-opacity duration-200">
                Power
              </span>
            )}
          </div>

          <button
            onClick={onMobileClose}
            className="md:hidden p-2 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div
          ref={navContainerRef}
          className={`flex-1 py-4 px-3 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}
        >
          {isCollapsed ? (
            /* Collapsed Mode - Only parent icons displayed */
            <div className="space-y-1.5">
              <NavLink
                to={dashboardPath}
                onClick={() => onMobileClose?.()}
                title={dashboardTitle}
                className={({ isActive }) =>
                  `flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    checkDashboardActive(isActive)
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
              </NavLink>

              {canAccessComplaints && (
                <NavLink
                  to="/complaints"
                  onClick={() => onMobileClose?.()}
                  title="Customer Complaints (CAPA)"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                    }`
                  }
                >
                  <FileSpreadsheet className="w-5 h-5 shrink-0" />
                </NavLink>
              )}

              {canAccessMeetings && (
                <NavLink
                  to="/meeting-invite"
                  onClick={() => onMobileClose?.()}
                  title="Tổ Chức Họp & Gửi Mail"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                    }`
                  }
                >
                  <Mail className="w-5 h-5 shrink-0" />
                </NavLink>
              )}

              {/* Statistics & Operations Section in Collapsed Mode */}
              {(statsSubItems.length > 0 || managementSubItems.length > 0) && (
                <>
                  <div className="my-2 border-t border-border-subtle mx-2" />

                  {/* Statistics Parent Item (Collapsed) */}
                  {statsSubItems.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => setActiveFlyout((prev) => (prev === 'stats' ? null : 'stats'))}
                        title="Statistics"
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                          isStatsRoute || activeFlyout === 'stats'
                            ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                        }`}
                      >
                        <BarChart3 className="w-5 h-5 shrink-0" />
                      </button>

                      {/* Floating flyout submenu for Statistics */}
                      <div
                        className={`absolute left-full top-0 pl-3 w-48 z-50 transition-all ${
                          activeFlyout === 'stats' ? 'block' : 'hidden group-hover:block'
                        }`}
                      >
                        <div className="bg-white border border-border-subtle rounded-2xl shadow-xl py-2 px-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle/60 mb-1">
                            Statistics
                          </div>
                          <div className="space-y-1">
                            {statsSubItems.map((item) => (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => {
                                  setActiveFlyout(null);
                                  onMobileClose?.();
                                }}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                                    isActive
                                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                                  }`
                                }
                              >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Management Parent Item (Collapsed) */}
                  {managementSubItems.length > 0 && (
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => setActiveFlyout((prev) => (prev === 'management' ? null : 'management'))}
                        title="Operations & Floors"
                        className={`w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                          isManagementRoute || activeFlyout === 'management'
                            ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                        }`}
                      >
                        <Layers className="w-5 h-5 shrink-0" />
                      </button>

                      {/* Floating flyout submenu for Management */}
                      <div
                        className={`absolute left-full top-0 pl-3 w-52 z-50 transition-all ${
                          activeFlyout === 'management' ? 'block' : 'hidden group-hover:block'
                        }`}
                      >
                        <div className="bg-white border border-border-subtle rounded-2xl shadow-xl py-2 px-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle/60 mb-1">
                            Operations & Floors
                          </div>
                          <div className="space-y-1">
                            {managementSubItems.map((item) => (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => {
                                  setActiveFlyout(null);
                                  onMobileClose?.();
                                }}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                                    isActive
                                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                                  }`
                                }
                              >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Team & Permissions Parent Item (Collapsed) */}
              {teamSubItems.length > 0 && (
                <>
                  <div className="my-2 border-t border-border-subtle mx-2" />
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setActiveFlyout((prev) => (prev === 'team' ? null : 'team'))}
                      title="Team & Permissions"
                      className={`w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer ${
                        isTeamRoute || activeFlyout === 'team'
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`}
                    >
                      <KeyRound className="w-5 h-5 shrink-0" />
                    </button>

                    {/* Floating flyout submenu for Team & Permissions */}
                    <div
                      className={`absolute left-full top-0 pl-3 w-56 z-50 transition-all ${
                        activeFlyout === 'team' ? 'block' : 'hidden group-hover:block'
                      }`}
                    >
                      <div className="bg-white border border-border-subtle rounded-2xl shadow-xl py-2 px-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle/60 mb-1">
                          Team & Permissions
                        </div>
                        <div className="space-y-1">
                          {teamSubItems.map((item) => (
                            <NavLink
                              key={item.name}
                              to={item.path}
                              onClick={() => {
                                setActiveFlyout(null);
                                onMobileClose?.();
                              }}
                              className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                                  isActive
                                    ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                                }`
                              }
                            >
                              <item.icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Expanded Mode */
            <div className="space-y-3">
              <div>
                <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Overview
                </h3>
                <NavLink
                  to={dashboardPath}
                  onClick={() => onMobileClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                      checkDashboardActive(isActive)
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                    }`
                  }
                >
                  <LayoutDashboard className="w-5 h-5 shrink-0" />
                  <span className="truncate">{dashboardTitle}</span>
                </NavLink>

                {canAccessComplaints && (
                  <NavLink
                    to="/complaints"
                    onClick={() => onMobileClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] mt-1 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`
                    }
                  >
                    <FileSpreadsheet className="w-5 h-5 shrink-0" />
                    <span className="truncate">Customer Complaints (CAPA)</span>
                  </NavLink>
                )}

                {canAccessMeetings && (
                  <NavLink
                    to="/meeting-invite"
                    onClick={() => onMobileClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] mt-1 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`
                    }
                  >
                    <Mail className="w-5 h-5 shrink-0" />
                    <span className="truncate">Tổ Chức Họp & Email</span>
                  </NavLink>
                )}
              </div>

              {(statsSubItems.length > 0 || managementSubItems.length > 0) && (
                <div>
                  <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Administration
                  </h3>
                  <div className="space-y-1.5">
                    {/* Statistics Group (Parent) */}
                    {statsSubItems.length > 0 && (
                      <div>
                        <button
                          type="button"
                          onClick={toggleStats}
                          className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer select-none ${
                            isStatsRoute
                              ? 'text-primary font-semibold bg-primary/5'
                              : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 shrink-0" />
                            <span className="truncate">Statistics</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                              isStatsOpen ? 'rotate-180 text-primary' : 'text-text-muted'
                            }`}
                          />
                        </button>

                        {/* Sub-items list for Statistics */}
                        {isStatsOpen && (
                          <div className="ml-5 pl-3 border-l-2 border-primary/20 space-y-1 mt-1">
                            {statsSubItems.map((item) => (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => onMobileClose?.()}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[40px] ${
                                    isActive
                                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                                  }`
                                }
                              >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operations & Floors Group (Parent) */}
                    {managementSubItems.length > 0 && (
                      <div>
                        <button
                          type="button"
                          onClick={toggleManagement}
                          className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer select-none ${
                            isManagementRoute
                              ? 'text-primary font-semibold bg-primary/5'
                              : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 shrink-0" />
                            <span className="truncate">Operations & Floors</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                              isManagementOpen ? 'rotate-180 text-primary' : 'text-text-muted'
                            }`}
                          />
                        </button>

                        {/* Sub-items list for Operations & Floors */}
                        {isManagementOpen && (
                          <div className="ml-5 pl-3 border-l-2 border-primary/20 space-y-1 mt-1">
                            {managementSubItems.map((item) => (
                              <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => onMobileClose?.()}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[40px] ${
                                    isActive
                                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                                  }`
                                }
                              >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Section: Team & Permissions */}
              {teamSubItems.length > 0 && (
                <div className="pt-2 border-t border-border-subtle/70">
                  <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Team & Security
                  </h3>
                  <div>
                    <button
                      type="button"
                      onClick={toggleTeam}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer select-none ${
                        isTeamRoute
                          ? 'text-primary font-semibold bg-primary/5'
                          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 shrink-0" />
                        <span className="truncate">Team & Permissions</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                          isTeamOpen ? 'rotate-180 text-primary' : 'text-text-muted'
                        }`}
                      />
                    </button>

                    {/* Sub-items list for Team & Permissions */}
                    {isTeamOpen && (
                      <div className="ml-5 pl-3 border-l-2 border-primary/20 space-y-1 mt-1">
                        {teamSubItems.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => onMobileClose?.()}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[40px] ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                                  : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                              }`
                            }
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Footer */}
        <div className="p-3 border-t border-border-subtle hidden md:block">
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center py-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-all cursor-pointer text-xs font-medium ${
              isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {!isCollapsed && <span className="font-semibold text-[13px]">Collapse</span>}
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
};