import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
];

const apiRoutes = [
  { name: 'Manage Users', path: '/admin/users', icon: Users },
  { name: 'Manage Roles', path: '/admin/roles', icon: Users },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-10 transition-transform transform hidden md:flex flex-col">
      <div className="flex justify-center items-center gap-2 mb-2 py-2">
        <span className="text-5xl font-extrabold text-black tracking-tighter">XP</span>
        <span className="text-4xl font-extrabold text-black tracking-tighter">Power</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 mb-4">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Admin Management
          </h3>
          <ul className="mt-4 space-y-1">
            {apiRoutes.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};
