import React, { useState } from 'react';
import { MailCheck, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { emailService } from '@/services/email';

export const QuickSmtpTestCard: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await emailService.testSmtpConnection(testEmail.trim());
      setResult({
        success: true,
        message: res.message || `Đã gửi email kiểm tra thành công tới: ${testEmail}`,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Gửi email kiểm tra thất bại. Hãy kiểm tra cấu hình SMTP trong application-dev.properties.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border-subtle rounded-xl p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-primary flex items-center justify-center">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              Kiểm Tra Nhanh Kết Nối SMTP (Quick SMTP Test)
              <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sẵn sàng
              </span>
            </h3>
            <p className="text-xs text-text-muted">
              Nhập email cá nhân của bạn để kiểm tra đường truyền gửi thư thực tế trước khi gửi thư mời họp.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTest} className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập email của bạn để nhận thử (VD: your_name@gmail.com)..."
            className="w-full px-3.5 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !testEmail.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 active:bg-primary text-white text-sm font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <MailCheck className="w-4 h-4" />
              <span>Gửi Mail Test</span>
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-semibold">{result.success ? 'Thành công: ' : 'Lỗi: '}</span>
            {result.message}
          </div>
        </div>
      )}
    </div>
  );
};
