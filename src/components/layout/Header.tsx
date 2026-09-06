import React from 'react';
import { authService } from '@/services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = authService.getUserRole();
  const isUser = role === 'ROLE_USER';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const renderUserLeftSection = () => {
    if (!isUser) return null;
    
    if (location.pathname === '/dashboard') {
      return (
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img alt="XP Power Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1X9HBdnsATqHDue-W6NYHhAaI3f9JsXt_ZcjMhUHYfonDroS57EAuRCIA4slTcrGKXb-f3d-XzI-WYGVW-VJpobmjsSNUxR8h2WRExosvyRXn9jSK5CgSV9mdA6f4EwCtCsf36Jht0PY3G4F5AXaj_L6hlOwUOqthog9TNY3WMCpx0ncrMqRrE4LPXyPZA7v-hCcTLtwGiOWnQkLTxW1w82qhsDJiWv-p_ngPwFejNuhxf18ZD8uspqxeF0" />
          <span className="hidden sm:inline-block h-4 w-px bg-border-strong"></span>
          <span className="hidden sm:inline-block font-label-sm text-text-muted uppercase tracking-widest text-[11px]">Global Portal</span>
        </div>
      );
    }

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
        items.push({ label: 'Test Details', path: location.pathname + location.search });
      }
    }

    return (
      <div className="flex items-center text-text-muted font-label-md text-[13px]">
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
    );
  };

  return (
    <header className="relative z-20 w-full border-b border-border-subtle bg-surface-card/85 backdrop-blur-md px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-3.5 shadow-sm">
      <div className="flex items-center justify-between max-w-[88rem] mx-auto w-full">
        <div className="flex items-center">
          {!isUser && (
            <button className="md:hidden p-2 text-text-secondary mr-4 hover:bg-surface-subtle rounded-lg transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
          {renderUserLeftSection()}
        </div>

        <div className="flex items-center gap-6">
          <button className="text-text-secondary hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-status-critical rounded-full border border-surface-card"></span>
          </button>

          <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-subtle p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border-subtle" onClick={handleLogout} title="Nhấn để đăng xuất">
            <div className="relative">
              <img
                src={'https://ui-avatars.com/api/?name=' + (isUser ? 'User' : 'Admin') + '&background=006194&color=fff&font-size=0.33'}
                alt="User avatar"
                className="w-8 h-8 rounded-full border border-border-subtle shadow-sm"
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
          </div>
        </div>
      </div>
    </header>
  );
};
