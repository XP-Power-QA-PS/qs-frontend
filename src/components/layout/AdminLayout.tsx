import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { authService } from '@/services/auth';

export const AdminLayout: React.FC = () => {
  const role = authService.getUserRole();
  const isUser = role === 'ROLE_USER';

  // Desktop sidebar collapsed state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  // Mobile sidebar drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('admin_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col">
      {!isUser && (
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      <div
        className={`${
          !isUser
            ? isCollapsed
              ? 'md:ml-20 md:w-[calc(100%-5rem)]'
              : 'md:ml-64 md:w-[calc(100%-16rem)]'
            : 'w-full'
        } min-h-screen flex flex-col transition-all duration-300 min-w-0`}
      >
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isCollapsed}
        />

        {/* Main Content Area - Master Layout for Horizontal Margins */}
        <main className="flex-1 w-full max-w-full lg:max-w-[96rem] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-1 sm:pt-2 pb-6 sm:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};