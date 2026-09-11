import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  X,
  Search,
  Globe,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react';
import type { EmailRecipient, RecipientUser } from '@/types/email';
import { emailService } from '@/services/email';

interface RecipientSelectorProps {
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  recipients,
  onChange,
}) => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<RecipientUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<'TO' | 'CC'>('TO');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for internal users
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await emailService.getRecipients(keyword.trim());
          setSearchResults(results);
          setShowDropdown(true);
        } catch (err) {
          console.error('Failed to search recipients:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add an internal user
  const handleAddInternalUser = (user: RecipientUser) => {
    if (recipients.some((r) => r.email.toLowerCase() === user.email.toLowerCase())) {
      return; // Already added
    }

    const newRecipient: EmailRecipient = {
      userId: user.id,
      name: user.fullName || user.username,
      email: user.email,
      department: user.department,
      recipientType: 'TO',
    };

    onChange([...recipients, newRecipient]);
    setKeyword('');
    setShowDropdown(false);
  };

  // Add a manual / external recipient
  const handleAddManual = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const email = manualEmail.trim();
    if (!email) return;

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Vui lòng nhập định dạng email hợp lệ (VD: user@example.com)');
      return;
    }

    if (recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
      alert('Email này đã có trong danh sách nhận thư.');
      return;
    }

    const newRecipient: EmailRecipient = {
      userId: null,
      name: manualName.trim() || email.split('@')[0],
      email: email,
      department: 'Khách ngoài',
      recipientType: manualType,
    };

    onChange([...recipients, newRecipient]);
    setManualEmail('');
    setManualName('');
  };

  // Remove a recipient
  const handleRemove = (emailToRemove: string) => {
    onChange(recipients.filter((r) => r.email.toLowerCase() !== emailToRemove.toLowerCase()));
  };

  // Toggle recipient type (TO <-> CC)
  const handleToggleType = (email: string) => {
    onChange(
      recipients.map((r) => {
        if (r.email.toLowerCase() === email.toLowerCase()) {
          return {
            ...r,
            recipientType: r.recipientType === 'TO' ? 'CC' : 'TO',
          };
        }
        return r;
      })
    );
  };

  const toCount = recipients.filter((r) => r.recipientType === 'TO').length;
  const ccCount = recipients.filter((r) => r.recipientType === 'CC').length;

  return (
    <div className="space-y-4">
      {/* Search Internal Users + Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          1. Tìm & Chọn Nhân Viên Nội Bộ (Internal CFT Members)
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => keyword.trim() && setShowDropdown(true)}
            placeholder="Gõ tên, username hoặc email nội bộ (VD: admin, Nguyen Van A...)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted"
          />
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              Đang tìm...
            </span>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-subtle rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-border-subtle">
            {searchResults.map((user) => {
              const isAdded = recipients.some((r) => r.email.toLowerCase() === user.email.toLowerCase());
              return (
                <div
                  key={user.id}
                  onClick={() => !isAdded && handleAddInternalUser(user)}
                  className={`p-3 flex items-center justify-between transition-colors ${
                    isAdded ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:bg-sky-50/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {user.fullName.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary flex items-center gap-2">
                        {user.fullName}
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                          {user.department}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">{user.email}</div>
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Đã chọn
                    </span>
                  ) : (
                    <span className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      <UserPlus className="w-3.5 h-3.5" /> Thêm
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual / External Email Input */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          2. Hoặc Nhập Email Bất Kỳ (Email Cá Nhân Để Test / Email Khách Hàng)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Tên người nhận (Tùy chọn)"
            className="sm:w-1/3 px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary placeholder:text-text-muted"
          />
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddManual();
              }
            }}
            placeholder="Nhập địa chỉ email (VD: test@gmail.com) rồi nhấn Enter..."
            className="flex-1 px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary placeholder:text-text-muted"
          />
          <div className="flex gap-2">
            <select
              value={manualType}
              onChange={(e) => setManualType(e.target.value as 'TO' | 'CC')}
              className="px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TO">TO (Chính)</option>
              <option value="CC">CC (Theo dõi)</option>
            </select>
            <button
              type="button"
              onClick={() => handleAddManual()}
              disabled={!manualEmail.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              + Thêm
            </button>
          </div>
        </div>
      </div>

      {/* Selected Recipients List */}
      <div className="pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs font-semibold text-text-secondary flex items-center gap-2">
            <span>DANH SÁCH NGƯỜI NHẬN ({recipients.length}):</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
              {toCount} TO
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
              {ccCount} CC
            </span>
          </div>
          {recipients.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {recipients.length === 0 ? (
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800 text-xs text-center">
            ⚠️ Chưa có người nhận nào được chọn. Hãy thêm ít nhất 1 email (TO) để có thể gửi thư mời.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            {recipients.map((r) => {
              const isTO = r.recipientType === 'TO';
              return (
                <div
                  key={r.email}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                    isTO
                      ? 'bg-sky-50/60 border-sky-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        r.userId ? 'bg-primary text-white' : 'bg-amber-600 text-white'
                      }`}
                      title={r.userId ? 'Thành viên nội bộ' : 'Email bên ngoài'}
                    >
                      {r.userId ? <Users className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate flex items-center gap-1.5">
                        <span className="truncate">{r.name || r.email}</span>
                        {r.department && (
                          <span className="text-[9px] px-1 py-0.2 bg-white/80 border border-slate-200 rounded text-slate-600 shrink-0">
                            {r.department}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">{r.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleType(r.email)}
                      title="Bấm để đổi giữa TO và CC"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        isTO
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {r.recipientType}
                      <ArrowUpDown className="w-2.5 h-2.5 opacity-60" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(r.email)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Xóa người nhận"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
