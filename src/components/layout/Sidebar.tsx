import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Statistics', path: '/stats', icon: BarChart3 },
];

const apiRoutes = [
  { name: 'Manage Users', path: '/admin/users', icon: Users },
  { name: 'Manage Roles', path: '/admin/roles', icon: Users },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Scrim */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden={!isOpen}
      />

      {/* Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl md:shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-subtle md:border-b-0">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-3xl font-extrabold text-black tracking-tighter">XP</span>
            <span className="text-2xl font-extrabold text-primary tracking-tighter">Power</span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-2 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 mb-4">
            <h3 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Admin Management
            </h3>
            <ul className="mt-3 space-y-1">
              {apiRoutes.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};