import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login({ usernameOrEmail, password });
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-surface min-h-screen flex items-center justify-center font-body-md text-text-primary">
      <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#f8faff]">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-sky-100/60 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/4 w-[500px] h-[300px] bg-primary-fixed/30 rounded-full blur-3xl"></div>
          <svg className="absolute inset-0 w-full h-full stroke-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="40" id="tech-grid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1"></path>
                <circle cx="40" cy="0" fill="#0284c7" opacity="0.25" r="1.5"></circle>
              </pattern>
            </defs>
            <rect fill="url(#tech-grid)" height="100%" width="100%"></rect>
          </svg>
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120 H 240 V 220 H 520" fill="none" stroke="#0284c7" strokeDasharray="6 6" strokeWidth="1.5"></path>
            <path d="M 1000 80 H 760 V 180 H 600" fill="none" stroke="#0284c7" strokeDasharray="6 6" strokeWidth="1.5"></path>
            <circle cx="240" cy="220" fill="#0284c7" r="3"></circle>
            <circle cx="760" cy="180" fill="#0284c7" r="3"></circle>
          </svg>
        </div>

        {/* Header */}
        <header className="relative z-20 w-full border-b border-border-subtle bg-surface-card/85 backdrop-blur-md px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-3.5">
          <div className="max-w-[88rem] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <a className="flex items-center space-x-3" href="#">
                <img alt="XP Power Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1X9HBdnsATqHDue-W6NYHhAaI3f9JsXt_ZcjMhUHYfonDroS57EAuRCIA4slTcrGKXb-f3d-XzI-WYGVW-VJpobmjsSNUxR8h2WRExosvyRXn9jSK5CgSV9mdA6f4EwCtCsf36Jht0PY3G4F5AXaj_L6hlOwUOqthog9TNY3WMCpx0ncrMqRrE4LPXyPZA7v-hCcTLtwGiOWnQkLTxW1w82qhsDJiWv-p_ngPwFejNuhxf18ZD8uspqxeF0" />
                <span className="hidden sm:inline-block h-4 w-px bg-border-strong"></span>
                <span className="hidden sm:inline-block font-label-sm text-text-muted uppercase tracking-widest text-[11px]">Global Portal</span>
              </a>
              <div className="hidden md:flex items-center space-x-2 text-text-secondary text-label-sm text-[11px]">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span className="font-semibold text-text-primary">Mission-Critical Access</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle">
                <span className="w-2 h-2 rounded-full bg-status-nominal animate-pulse"></span>
                <span className="font-label-sm text-text-secondary text-[11px]">All Systems Operational</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-space-base sm:p-space-lg my-auto">
          <div className="w-full max-w-lg bg-surface-card/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-xl p-space-lg sm:p-space-xl space-y-space-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2.5 bg-surface-subtle rounded-xl border border-border-subtle mb-1 shadow-sm">
                <img alt="XP Power" className="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1X9HBdnsATqHDue-W6NYHhAaI3f9JsXt_ZcjMhUHYfonDroS57EAuRCIA4slTcrGKXb-f3d-XzI-WYGVW-VJpobmjsSNUxR8h2WRExosvyRXn9jSK5CgSV9mdA6f4EwCtCsf36Jht0PY3G4F5AXaj_L6hlOwUOqthog9TNY3WMCpx0ncrMqRrE4LPXyPZA7v-hCcTLtwGiOWnQkLTxW1w82qhsDJiWv-p_ngPwFejNuhxf18ZD8uspqxeF0" />
              </div>
              <div className="inline-flex items-center space-x-1.5 text-primary font-label-sm font-semibold uppercase tracking-wider text-[11px]">
                <span className="material-symbols-outlined text-[16px]">shield_lock</span>
                <span>Tier-4 Enterprise Authentication</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full h-px bg-border-subtle"></div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-primary text-[13px]" htmlFor="corp-email">Employee ID / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] transition-all text-[14px]" 
                    id="corp-email" 
                    placeholder="name@xppower.com or corporate alias" 
                    required 
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-label-md text-text-primary text-[13px]" htmlFor="corp-password">Enterprise Password</label>
                  <button className="inline-flex items-center space-x-1 text-primary hover:text-primary-container font-label-sm text-[12px] transition-colors" type="button">
                    <span className="material-symbols-outlined text-[14px]">key</span>
                    <span>Use Passkey / Token</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <input 
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] transition-all text-[14px]" 
                    id="corp-password" 
                    placeholder="••••••••••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input className="w-4 h-4 rounded text-primary focus:ring-0 bg-surface-subtle accent-[#006194]" type="checkbox" />
                  <span className="font-body-sm text-text-secondary text-[12px]">Remember this device (30 days)</span>
                </label>
                <a className="font-label-md text-[12px] text-primary hover:underline" href="#">Forgot password / Key?</a>
              </div>

              <button 
                className="w-full mt-4 py-2.5 px-6 bg-[#0284C7] hover:bg-[#0369a1] text-white font-headline-sm text-[16px] rounded-lg shadow transition-colors flex items-center justify-center space-x-2" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Enterprise Portal'}</span>
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </form>

            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-surface-subtle rounded-lg border border-border-subtle">
                <span className="material-symbols-outlined text-status-nominal text-[16px]">verified</span>
                <span className="font-technical-data text-[12px] text-text-secondary">Hardware-enforced MFA (FIDO2 / WebAuthn) Tier-4 Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-20 w-full border-t border-border-subtle bg-surface-card/85 backdrop-blur-md px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-3">
          <div className="max-w-[88rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-text-muted font-body-sm text-[12px]">
            <div className="flex items-center space-x-4 flex-wrap">
              <span>© 2025 XP Power Ltd.</span>
              <span className="hidden sm:inline">•</span>
              <span>ISO 9001 / ISO 13485 Certified</span>
              <span className="hidden sm:inline">•</span>
              <span>AS9100D Aerospace Standard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-nominal"></span>
                <span className="text-text-secondary font-technical-data text-[11px]">AES-256 Encrypted Telemetry</span>
              </div>
              <a className="hover:text-text-primary transition-colors" href="#">Security &amp; Privacy Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};
