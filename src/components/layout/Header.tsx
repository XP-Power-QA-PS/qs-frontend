import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 relative z-10">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-white mr-4">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-white hover:text-white/80 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout} title="Click to Logout">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
            alt="User avatar"
            className="w-9 h-9 rounded-full border-2 border-white/30"
          />
          <span className="text-sm font-medium text-white hidden sm:block">
            Argon Admin
          </span>
        </div>
      </div>
    </header>
  );
};
