import React from 'react';
import { Mail, Calendar, Clock, MapPin, FileText, Paperclip, CheckCircle2, User } from 'lucide-react';
import type { MeetingEmailRequest } from '@/types/email';

interface EmailLivePreviewProps {
  request: MeetingEmailRequest;
}

export const EmailLivePreview: React.FC<EmailLivePreviewProps> = ({ request }) => {
  const toList = request.recipients.filter((r) => r.recipientType === 'TO');
  const ccList = request.recipients.filter((r) => r.recipientType === 'CC');

  return (
    <div className="bg-white border border-border-subtle rounded-xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Mail Window Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-sky-400" /> Xem Trước Email Thực Tế (Live Preview)
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Template: meeting-invitation.html</span>
      </div>

      {/* Email Meta Bar */}
      <div className="bg-slate-50 border-b border-border-subtle p-3.5 text-xs space-y-1.5 font-sans">
        <div className="flex gap-2">
          <span className="text-text-muted w-14 shrink-0 font-medium">Tiêu đề:</span>
          <span className="font-semibold text-text-primary">
            [QS-ALERT] Thư mời họp đánh giá sơ bộ: Khiếu nại #{request.trackingNo || '2026-09-XXXX'}
            {request.model ? ` - ${request.model}` : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted w-14 shrink-0 font-medium">Đến (TO):</span>
          <div className="text-text-primary flex flex-wrap gap-1">
            {toList.length > 0 ? (
              toList.map((r) => (
                <span
                  key={r.email}
                  className="inline-block px-2 py-0.5 rounded bg-sky-100/80 text-sky-900 border border-sky-200 text-[11px]"
                >
                  {r.name || r.email}
                </span>
              ))
            ) : (
              <span className="text-rose-500 italic">Chưa chọn người nhận chính (TO)</span>
            )}
          </div>
        </div>
        {ccList.length > 0 && (
          <div className="flex gap-2">
            <span className="text-text-muted w-14 shrink-0 font-medium">CC:</span>
            <div className="text-text-primary flex flex-wrap gap-1">
              {ccList.map((r) => (
                <span
                  key={r.email}
                  className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px]"
                >
                  {r.name || r.email}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 items-center text-slate-600 pt-1">
          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
          <span>File đính kèm:</span>
          <span className="font-mono bg-white px-2 py-0.5 border border-border-subtle rounded text-[11px] text-primary font-bold">
            meeting-invite.ics (iCalendar)
          </span>
        </div>
      </div>

      {/* Email Body Simulation */}
      <div className="p-5 flex-1 overflow-y-auto bg-slate-100/60 font-sans text-xs sm:text-sm">
        <div className="max-w-xl mx-auto bg-white border border-border-subtle rounded-lg shadow-xs overflow-hidden">
          {/* Email Header Banner */}
          <div className="bg-gradient-to-r from-[#006194] to-[#004b73] text-white p-5 text-left">
            <span className="inline-block bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
              QS Quality System • Preliminary Review
            </span>
            <h2 className="text-base sm:text-lg font-bold m-0 leading-tight">
              THƯ MỜI HỌP ĐÁNH GIÁ KHIẾU NẠI KHÁCH HÀNG
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-slate-700 leading-relaxed text-xs">
              Kính gửi các thành viên đội ngũ liên chức năng (CFT),<br />
              Hệ thống chất lượng QS kính gửi thông tin cuộc họp đánh giá sơ bộ cho khiếu nại khách hàng: 
              <strong className="text-primary font-bold ml-1">#{request.trackingNo || '2026-09-XXXX'}</strong>.
            </p>

            {/* 4 CORE MEETING FIELDS HIGHLIGHT BOX */}
            <div className="bg-sky-50/80 border border-sky-200 border-l-4 border-l-[#006194] rounded-md p-3.5 text-xs space-y-2">
              <h3 className="text-[#004b73] font-bold text-xs uppercase tracking-wider mb-2">
                THÔNG TIN CUỘC HỌP (MEETING DETAILS)
              </h3>
              
              <div className="grid grid-cols-[110px_1fr] gap-1 items-center">
                <span className="text-sky-900 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#006194]" /> Ngày họp:
                </span>
                <span className="font-bold text-slate-900">{request.meetingDate || 'Chưa chọn'}</span>
              </div>

              <div className="grid grid-cols-[110px_1fr] gap-1 items-center">
                <span className="text-sky-900 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#006194]" /> Giờ họp:
                </span>
                <span className="font-bold text-slate-900">
                  {request.startTime || '--:--'} {request.endTime ? `- ${request.endTime}` : ''} (GMT+7)
                </span>
              </div>

              <div className="grid grid-cols-[110px_1fr] gap-1 items-center">
                <span className="text-sky-900 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#006194]" /> Phòng họp:
                </span>
                <span className="font-bold text-slate-900 break-all">
                  {request.roomLocation || 'Chưa nhập phòng họp / link'}
                </span>
              </div>

              <div className="grid grid-cols-[110px_1fr] gap-1 items-start pt-1">
                <span className="text-sky-900 font-semibold flex items-center gap-1.5 mt-1">
                  <FileText className="w-3.5 h-3.5 text-[#006194]" /> Nội dung:
                </span>
                <div className="bg-white border border-sky-100 rounded p-2 text-slate-800 whitespace-pre-line text-xs font-normal">
                  {request.agenda || 'Nội dung chương trình họp...'}
                </div>
              </div>

              {request.organizerName && (
                <div className="grid grid-cols-[110px_1fr] gap-1 items-center pt-1 border-t border-sky-200/60">
                  <span className="text-sky-900 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#006194]" /> Người triệu tập:
                  </span>
                  <span className="font-medium text-slate-800">
                    {request.organizerName} {request.organizerEmail ? `(${request.organizerEmail})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* iCalendar notification */}
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-md text-[11px] leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                File lịch đính kèm <strong>(meeting-invite.ics)</strong> được gửi kèm. Người nhận có thể bấm <strong>Accept</strong> trên Outlook để tự động đồng bộ vào lịch.
              </div>
            </div>

            {/* Complaint summary */}
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-800 pb-1 border-b border-border-subtle">
                TÓM TẮT HỒ SƠ KHIẾU NẠI
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-1 py-1 text-slate-700">
                <span className="text-text-muted">Mã theo dõi:</span>
                <span className="font-semibold text-slate-900">#{request.trackingNo}</span>
              </div>
              {request.customerName && (
                <div className="grid grid-cols-[120px_1fr] gap-1 py-1 text-slate-700">
                  <span className="text-text-muted">Khách hàng:</span>
                  <span>{request.customerName}</span>
                </div>
              )}
              {request.model && (
                <div className="grid grid-cols-[120px_1fr] gap-1 py-1 text-slate-700">
                  <span className="text-text-muted">Model:</span>
                  <span className="font-medium">{request.model}</span>
                </div>
              )}
              {request.issueDescription && (
                <div className="grid grid-cols-[120px_1fr] gap-1 py-1 text-slate-700">
                  <span className="text-text-muted">Hiện tượng lỗi:</span>
                  <span>{request.issueDescription}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border-t border-border-subtle p-3 text-center text-[10px] text-text-muted">
            Email tự động từ Hệ thống Quản lý Chất lượng QS (Quality System).
          </div>
        </div>
      </div>
    </div>
  );
};
