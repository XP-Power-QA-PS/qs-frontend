import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintCreateRequest, ComplaintDetail } from '@/types/complaint/complaint.types';
import { useNavigate } from 'react-router-dom';

interface ComplaintCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: ComplaintDetail) => void;
}

export const ComplaintCreateModal: React.FC<ComplaintCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintDetail | null>(null);

  const [formData, setFormData] = useState<ComplaintCreateRequest>({
    receivedDate: new Date().toISOString().slice(0, 10),
    customerName: '',
    model: '',
    issueDescription: '',
    defectCategory: 'Mechanical',
    defectName: '',
    quantity: 1,
    customerFinding: '',
    serialNumbers: '',
    area: 'Production Line',
    internalExternal: 'EXTERNAL',
    buildingStage: 'MP',
    pictureUrls: '',
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? (value ? parseInt(value, 10) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await complaintService.createComplaint(formData);
      setCreatedComplaint(result);
      onSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create customer complaint record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToMeeting = () => {
    if (createdComplaint) {
      onClose();
      navigate(`/meeting-invite?complaintId=${createdComplaint.id}`, {
        state: { complaint: createdComplaint },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-border-subtle rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Customer Complaint Intake (Phase 1)
              </h2>
              <p className="text-xs text-text-muted">
                Initial intake & automatic tracking code generation for quality investigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdComplaint ? (
          /* Step Success Prompt */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Complaint Intake Recorded Successfully!
              </h3>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary font-mono font-bold text-base">
                Tracking No: {createdComplaint.trackingNo}
              </div>
              <p className="text-xs text-text-muted mt-2">
                Year: {createdComplaint.year} | Model: {createdComplaint.model} | Customer: {createdComplaint.customerName}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-600" />
                Jeanette SLA Milestone: 1 Business Day
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Quality standards require CQE to <strong>convene the Cross-Functional Team (CFT) and conduct a Preliminary Review</strong> within 1 business day to assess the issue and define containment actions.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-lg transition-colors"
              >
                Dismiss (Later)
              </button>
              <button
                type="button"
                onClick={handleGoToMeeting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                Schedule Preliminary Review Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Unable to save complaint:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Received Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary cursor-pointer hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g., Foxconn, Pegatron..."
                  required
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Model / Product Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., MDL-9000, ABC-100..."
                  required
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Defect Category
                </label>
                <select
                  name="defectCategory"
                  value={formData.defectCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Functional">Functional</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Firmware">Firmware / Software</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Specific Defect Name
                </label>
                <input
                  type="text"
                  name="defectName"
                  value={formData.defectName}
                  onChange={handleChange}
                  placeholder="e.g., Abnormal noise, Scratch, Burrs..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Defect Quantity (Qty EA)
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Customer Finding
              </label>
              <input
                type="text"
                name="customerFinding"
                value={formData.customerFinding}
                onChange={handleChange}
                placeholder="e.g., Customer noticed vibration during high-speed rotation..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Issue Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="issueDescription"
                rows={3}
                value={formData.issueDescription}
                onChange={handleChange}
                required
                placeholder="Describe failure symptoms, occurrence conditions, customer observations..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Originating Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., SMT Line 2, Final Assembly, Warehouse..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Serial Numbers (SN)
                </label>
                <input
                  type="text"
                  name="serialNumbers"
                  value={formData.serialNumbers}
                  onChange={handleChange}
                  placeholder="e.g., SN001, SN002, LOT-202609A..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-secondary">
                  Picture URLs / Defect Evidence
                </label>
                <span className="text-[10px] text-text-muted font-normal">
                  Separate multiple URLs with commas or newlines
                </span>
              </div>
              <textarea
                name="pictureUrls"
                rows={2}
                value={formData.pictureUrls || ''}
                onChange={handleChange}
                placeholder="e.g., https://intranet/defect1.jpg, https://intranet/defect2.jpg..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-[11px]"
              />
              {/* Image Previews if URLs are provided */}
              {formData.pictureUrls && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border-subtle/60">
                  {formData.pictureUrls
                    .split(/[\n,]/)
                    .map((url) => url.trim())
                    .filter((url) => url.length > 0)
                    .map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs group"
                      >
                        <img
                          src={url}
                          alt={`Defect ${idx + 1}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Preview+Error';
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Record (Generate Tracking Code)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
