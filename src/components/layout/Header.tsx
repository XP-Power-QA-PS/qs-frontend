import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = authService.getUserRole();
  const isUser = role === 'ROLE_USER';
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getBreadcrumbItems = () => {
    const searchParams = new URLSearchParams(location.search);
    const floorId = searchParams.get('floorId');
    const floorName = searchParams.get('floorName');

    const items = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    if (location.pathname.startsWith('/equipments')) {
      if (floorName && floorId) {
        items.push({ label: 'Check ' + floorName, path: '/equipments?floorId=' + floorId + '&floorName=' + encodeURIComponent(floorName) });
      } else {
        items.push({ label: 'Equipments', path: '/equipments' });
      }

      if (location.pathname.includes('/history')) {
        items.push({ label: 'Test History', path: location.pathname + location.search });
      } else if (location.pathname.includes('/records/')) {
        const match = location.pathname.match(/\/equipments\/([^/]+)\/records\//);
        if (match) {
          const equipmentId = match[1];
          items.push({ label: 'Test History', path: '/equipments/' + equipmentId + '/history' + location.search });
        }
        items.push({ label: 'Daily Details', path: location.pathname + location.search });
      }
    }

    return items;
  };

  const renderUserLeftSection = () => {
    if (!isUser) {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-headline-sm text-text-primary hidden sm:inline-block">Admin Portal</span>
        </div>
      );
    }

    if (location.pathname === '/dashboard') {
      return (
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img alt="XP Power Logo" className="h-7 sm:h-8 w-auto object-contain" src="/logo-xppower.png" />
          <span className="hidden sm:inline-block h-4 w-px bg-border-strong"></span>
          <span className="hidden sm:inline-block font-label-sm text-text-muted uppercase tracking-widest text-[11px]">Global Portal</span>
        </div>
      );
    }

    const items = getBreadcrumbItems();
    const currentItem = items[items.length - 1];
    const prevItem = items.length > 1 ? items[items.length - 2] : items[0];

    return (
      <>
        {/* Mobile Compact Back & Title View */}
        <div className="flex items-center md:hidden gap-1.5">
          <button
            onClick={() => navigate(prevItem.path)}
            className="p-1.5 -ml-1 text-text-secondary hover:text-primary hover:bg-surface-subtle rounded-lg transition-colors flex items-center justify-center min-h-[40px] min-w-[40px]"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <span className="font-headline-sm text-text-primary text-[15px] truncate max-w-[170px]">
            {currentItem?.label || 'Overview'}
          </span>
        </div>

        {/* Desktop / Tablet Full Breadcrumbs */}
        <div className="hidden md:flex items-center text-text-muted font-label-md text-[13px]">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={index}>
                <span
                  className={`cursor-pointer transition-colors ${isLast ? 'text-primary font-semibold' : 'hover:text-text-primary'}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </span>
                {!isLast && (
                  <span className="material-symbols-outlined mx-1 text-[16px] opacity-50">chevron_right</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-subtle bg-surface-card/90 backdrop-blur-md px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-2.5 sm:py-3.5 shadow-xs transition-all">
      <div className="flex items-center justify-between max-w-[88rem] mx-auto w-full">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {!isUser && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 -ml-1 text-text-secondary hover:text-primary hover:bg-surface-subtle rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}
          {renderUserLeftSection()}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Notification Button */}
          <button className="p-2 text-text-secondary hover:text-primary hover:bg-surface-subtle rounded-lg transition-colors relative min-h-[40px] min-w-[40px] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full border border-surface-card"></span>
          </button>

          {/* User Profile Pill / Menu Trigger */}
          <div className="relative">
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:bg-surface-subtle p-1 sm:p-1.5 sm:pr-3 rounded-full transition-colors border border-transparent hover:border-border-subtle"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="User profile"
            >
              <div className="relative">
                <img
                  src={'https://ui-avatars.com/api/?name=' + (isUser ? 'User' : 'Admin') + '&background=006194&color=fff&font-size=0.33'}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border border-border-subtle shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-nominal border-2 border-surface-card rounded-full animate-pulse"></span>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[12px] font-semibold text-text-primary leading-tight">
                  {isUser ? 'Người dùng' : 'Quản trị viên'}
                </span>
                <span className="text-[10px] font-technical-data text-text-muted leading-tight">
                  Active Session
                </span>
              </div>
              <span className="material-symbols-outlined text-text-muted text-[16px] hidden sm:inline-block">
                expand_more
              </span>
            </div>

            {/* Profile Dropdown / Action Sheet */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-surface-card rounded-xl border border-border-subtle shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <p className="text-xs font-semibold text-text-primary">{isUser ? 'Field Technician' : 'System Administrator'}</p>
                    <p className="text-[11px] text-text-muted">{isUser ? 'ROLE_USER' : 'ROLE_ADMIN'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-status-critical hover:bg-status-critical/10 rounded-lg transition-colors font-medium min-h-[40px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Đăng xuất (Logout)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};