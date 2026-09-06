import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { authService } from '../../services/authService';

export const AdminLayout: React.FC = () => {
  const role = authService.getUserRole();
  const isUser = role === 'ROLE_USER';

  return (
    <div className="min-h-screen bg-[#f8f9fe]">
      {!isUser && <Sidebar />}
      
      <div className={`${!isUser ? 'md:ml-64' : ''} min-h-screen flex flex-col transition-all duration-300`}>
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

