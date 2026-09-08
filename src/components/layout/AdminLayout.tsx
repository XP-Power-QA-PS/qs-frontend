import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { authService } from '../../services/authService';

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

      <div className={`${!isUser ? 'md:ml-64' : ''} min-h-screen flex flex-col transition-all duration-300`}>
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};