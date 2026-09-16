import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Sparkles,
  FileText,
  FileSpreadsheet,
  FolderCheck,
  RotateCcw,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

// Modular Feature Components
import { ComplaintInfoTab } from '@/components/features/complaint/tabs/ComplaintInfoTab';
import { ComplaintActionBoard } from '@/components/features/complaint/tabs/ComplaintActionBoard';
import { ComplaintMeetingsTab } from '@/components/features/complaint/tabs/ComplaintMeetingsTab';
import { ComplaintClosureModal } from '@/components/features/complaint/modals/ComplaintClosureModal';
import { ReopenTicketModal } from '@/components/features/complaint/modals/ReopenTicketModal';
import { ImageLightboxModal } from '@/components/features/complaint/modals/ImageLightboxModal';
import { EditDefectPicturesModal } from '@/components/features/complaint/modals/EditDefectPicturesModal';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Tab management: 'info' | 'action' | 'meetings'
  const initialTab = (searchParams.get('tab') as 'info' | 'action' | 'meetings') || 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'action' | 'meetings'>(initialTab);

  // Modals state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showEditPictureModal, setShowEditPictureModal] = useState<boolean>(false);
  const [showClosureModal, setShowClosureModal] = useState<boolean>(false);
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);

  // Update states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err: any) {
      console.error('Failed to load complaint detail', err);
      toast.error('Failed to load complaint details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (complaint?.trackingNo) {
      try {
        sessionStorage.setItem(`trackingNo_${complaint.id}`, complaint.trackingNo);
      } catch (ignored) { }

      // If current URL param is numeric ID, replace with clean trackingNo
      if (id && id !== complaint.trackingNo && /^\d+$/.test(id)) {
        navigate(`/complaints/${complaint.trackingNo}${window.location.search}`, {
          replace: true,
          state: { trackingNo: complaint.trackingNo },
        });
      }
    }
  }, [complaint, id, navigate]);

  const handleUpdate = async (
    payload: ComplaintUpdateRequest,
    successMessage: string
  ): Promise<boolean> => {
    if (!complaint) return false;
    setIsUpdating(true);
    try {
      const updated = await complaintService.updateComplaint(complaint.id, payload);
      setComplaint(updated);
      toast.success(successMessage);
      return true;
    } catch (err: any) {
      const msg = err.message || 'Update failed. Please check network connection and try again.';
      toast.error(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!complaint) return;
    setIsExporting(true);
    try {
      await complaintService.exportComplaintsExcel(complaint.year);
      toast.success(`Successfully exported complaint report for ${complaint.year}!`);
    } catch (err: any) {
      console.error('Export failed', err);
      toast.error('Failed to export Excel report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-text-muted text-xs">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-text-primary">Complaint Case Not Found</h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          The requested complaint does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/complaints')}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Back to Complaint List
        </button>
      </div>
    );
  }

  const isClosed = complaint.status === 'CLOSED';

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Sticky Unified Top Tab Navigation & Action Bar */}
      <div className="sticky top-[57px] sm:top-[65px] z-30 bg-[#f8f9fe]/95 backdrop-blur-md -mx-margin-mobile md:-mx-margin-tablet lg:-mx-margin-desktop px-margin-mobile md:px-margin-tablet lg:px-margin-desktop pt-2 border-b border-border-subtle transition-all">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 max-w-[96rem] mx-auto">
          {/* Left: 3 Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Complaint Information (Intake Details)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('action')}
              className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'action'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Action & Resolution (CAPA Workspace)
              {complaint.containmentAction && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'meetings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Review Meetings
              {complaint.meetings && complaint.meetings.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {complaint.meetings.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pb-2 shrink-0">
            {/* Status Indicator (Compact & Subtle) */}
            {isClosed && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
                title={`Closed on ${complaint.closureDate || 'N/A'} (Ageing: ${complaint.ageingClosed ?? 0} days)${complaint.remarks ? `\nRemarks: ${complaint.remarks}` : ''}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Closed • {complaint.ageingClosed ?? 0}d
              </span>
            )}

            {/* Action: Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-subtle hover:bg-surface-canvas text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Export 32-column Excel template"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
              Export Excel
            </button>

            {/* Action: Schedule Review Meeting */}
            <button
              type="button"
              onClick={() => navigate(`/meeting-invite?complaintId=${complaint.id}`, { state: { complaint } })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 shadow-2xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Meeting
            </button>

            {/* Action: Close Complaint Modal */}
            {!isClosed ? (
              <button
                type="button"
                onClick={() => setShowClosureModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <FolderCheck className="w-3.5 h-3.5" />
                Close Case
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen Case
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Detailed Intake Info */}
      {activeTab === 'info' && (
        <ComplaintInfoTab
          complaint={complaint}
          isUpdating={isUpdating}
          onUpdate={handleUpdate}
          onOpenEditPictures={() => setShowEditPictureModal(true)}
          onPreviewImage={setPreviewImageUrl}
        />
      )}

      {/* Tab 2: Unified CAPA Action Board (Containment + Root Cause + CAPA) */}
      {activeTab === 'action' && (
        <ComplaintActionBoard
          complaint={complaint}
          isUpdating={isUpdating}
          onUpdate={handleUpdate}
        />
      )}

      {/* Tab 3: Review Meetings */}
      {activeTab === 'meetings' && (
        <ComplaintMeetingsTab
          complaint={complaint}
        />
      )}

      {/* Modals */}
      {showClosureModal && (
        <ComplaintClosureModal
          isOpen={showClosureModal}
          complaint={complaint}
          onClose={() => setShowClosureModal(false)}
          onSuccess={(updated) => {
            setComplaint(updated);
            toast.success('Complaint case closed successfully!');
          }}
        />
      )}

      {showReopenModal && (
        <ReopenTicketModal
          isOpen={showReopenModal}
          complaint={complaint}
          onClose={() => setShowReopenModal(false)}
          onSuccess={(updated) => {
            setComplaint(updated);
            toast.success('Complaint case reopened successfully.');
          }}
        />
      )}

      {showEditPictureModal && (
        <EditDefectPicturesModal
          isOpen={showEditPictureModal}
          complaint={complaint}
          onClose={() => setShowEditPictureModal(false)}
          onSuccess={(updated) => {
            setComplaint(updated);
            toast.success('Defect pictures updated successfully!');
          }}
        />
      )}

      {previewImageUrl && (
        <ImageLightboxModal
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      )}

    </div>
  );
};
