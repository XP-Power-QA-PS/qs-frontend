import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { authService } from '@/services/auth';

export const AdminLayout: React.FC = () => {
  const role = authService.getUserRole();
  const isUser = role === 'ROLE_USER';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fe] flex flex-col">
      {!isUser && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`${!isUser ? 'md:ml-64' : ''} min-h-screen flex flex-col transition-all duration-300 w-full max-w-full overflow-x-hidden min-w-0`}>
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Main Content Area - Master Layout for Horizontal Margins */}
        <main className="flex-1 w-full max-w-full lg:max-w-[96rem] mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-1 sm:pt-2 pb-6 sm:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};