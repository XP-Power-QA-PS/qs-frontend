import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Calendar, CheckCircle2, ArrowRight, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import { storageService } from '@/services/storage';
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
    area: '',
    internalExternal: 'EXTERNAL',
    buildingStage: 'MP',
    originOfComplaint: 'Customer',
    salesforceCapa: '',
    pictureUrls: '',
    priority: 'MEDIUM',
  });

  interface UploadingPicture {
    id: string;
    file: File;
    previewUrl: string;
    tmpKey?: string;
    isUploading: boolean;
    progress: number;
    error?: string;
  }
  const [uploadedPictures, setUploadedPictures] = useState<UploadingPicture[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePictureFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);

      const newPic: UploadingPicture = {
        id,
        file,
        previewUrl,
        isUploading: true,
        progress: 0,
      };

      setUploadedPictures((prev) => [...prev, newPic]);

      try {
        const presigned = await storageService.getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          fileSize: file.size,
          category: 'complaint',
        });

        await storageService.uploadToMinio(presigned.uploadUrl, file, (percent) => {
          setUploadedPictures((prev) =>
            prev.map((p) => (p.id === id ? { ...p, progress: percent } : p))
          );
        });

        setUploadedPictures((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isUploading: false, tmpKey: presigned.tmpKey } : p
          )
        );
      } catch (err: any) {
        setUploadedPictures((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isUploading: false, error: err.message || 'Upload failed' } : p
          )
        );
      }
    }
  };

  const handleRemoveUploadedPicture = (id: string) => {
    setUploadedPictures((prev) => prev.filter((p) => p.id !== id));
  };

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

    const isAnyUploading = uploadedPictures.some((p) => p.isUploading);
    if (isAnyUploading) {
      setErrorMessage('Vui lòng đợi các hình ảnh tải lên máy chủ MinIO hoàn tất trước khi lưu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tmpKeys = uploadedPictures.filter((p) => p.tmpKey).map((p) => p.tmpKey!);
      const payload: ComplaintCreateRequest = {
        ...formData,
        pictureTmpKeys: tmpKeys.length > 0 ? tmpKeys : undefined,
      };
      const result = await complaintService.createComplaint(payload);
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
      <div className="bg-white border border-border-subtle rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
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
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
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
                className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-lg transition-colors cursor-pointer"
              >
                Dismiss (Later)
              </button>
              <button
                type="button"
                onClick={handleGoToMeeting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Schedule Preliminary Review Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Unable to save complaint:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Row 1: Timeline & Classification (Excel Col 7, 9, 8, 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-surface-canvas/60 rounded-xl border border-border-subtle/80">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Received Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border-subtle rounded-lg text-text-primary cursor-pointer hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Internal / External
                </label>
                <select
                  name="internalExternal"
                  value={formData.internalExternal}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border-subtle rounded-lg text-text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="EXTERNAL">External (Khách hàng)</option>
                  <option value="INTERNAL">Internal (Nội bộ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Origin of Complaint
                </label>
                <select
                  name="originOfComplaint"
                  value={formData.originOfComplaint}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Customer">Customer (Khách hàng)</option>
                  <option value="Market / Field">Market / Field (Thị trường)</option>
                  <option value="Internal OQC">Internal OQC (Kiểm tra nội bộ)</option>
                  <option value="Supplier">Supplier (Nhà cung ứng)</option>
                  <option value="Third-Party Audit">Third-Party Audit (Kiểm toán)</option>
                  <option value="Other">Other (Khác)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Building Stage
                </label>
                <select
                  name="buildingStage"
                  value={formData.buildingStage}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="MP">MP (Mass Production)</option>
                  <option value="Pilot">Pilot / Ramp-up</option>
                  <option value="NPI">NPI (New Product Intro)</option>
                  <option value="Proto">Prototype / EVT / DVT</option>
                </select>
              </div>
            </div>

            {/* Row 2: Customer & Product (Excel Col 12, 13, 10) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Salesforce CAPA (Ref No.)
                </label>
                <input
                  type="text"
                  name="salesforceCapa"
                  value={formData.salesforceCapa || ''}
                  onChange={handleChange}
                  placeholder="e.g., SF-CAPA-2026-091..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Row 3: Defect Specifics (Excel Col 15, 16, 17) */}
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
                  <option value="Mechanical">Mechanical (Cơ khí / Lắp ráp)</option>
                  <option value="Electrical">Electrical (Điện tử / Mạch)</option>
                  <option value="Cosmetic">Cosmetic (Ngoại quan / Trầy xước)</option>
                  <option value="Functional">Functional (Tính năng / Hiệu năng)</option>
                  <option value="Packaging">Packaging (Đóng gói / Tem nhãn)</option>
                  <option value="Firmware">Firmware / Software</option>
                  <option value="Other">Other (Khác)</option>
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
                  Defect Quantity (Q'ty EA)
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

            {/* Row 4: Findings & Description (Excel Col 12, 14) */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Customer Finding / Feedback
              </label>
              <input
                type="text"
                name="customerFinding"
                value={formData.customerFinding}
                onChange={handleChange}
                placeholder="e.g., Customer noticed vibration during high-speed rotation test at inbound hub..."
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
                placeholder="Describe failure symptoms, occurrence conditions, customer observations, impact..."
                className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans"
              />
            </div>

            {/* Row 5: Area & SN (Excel Col 12, 19) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., SMT Line 2, Final Assembly, Packing..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  SN (Serial Number)
                </label>
                <input
                  type="text"
                  name="serialNumbers"
                  value={formData.serialNumbers}
                  onChange={handleChange}
                  placeholder="e.g., SN001, SN002, LOT-202609A..."
                  className="w-full px-3 py-2 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Row 6: Defect Pictures & Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Defect Pictures & Evidence (Hình ảnh lỗi)
                </label>
                <span className="text-[10px] text-text-muted">
                  Tải trực tiếp lên MinIO hoặc dán liên kết ảnh
                </span>
              </div>

              {/* MinIO Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-subtle hover:border-primary/50 bg-surface-canvas/50 hover:bg-surface-canvas rounded-xl p-4 text-center cursor-pointer transition-colors space-y-1.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePictureFilesSelect(e.target.files)}
                />
                <div className="flex items-center justify-center gap-2 text-primary">
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-xs font-semibold">Nhấp để tải lên nhiều ảnh lỗi (MinIO)</span>
                </div>
                <p className="text-[11px] text-text-muted">Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 20MB/ảnh)</p>
              </div>

              {/* Uploaded Pictures Thumbnails with progress */}
              {uploadedPictures.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-text-secondary block">
                    Ảnh đã chọn ({uploadedPictures.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {uploadedPictures.map((pic) => (
                      <div
                        key={pic.id}
                        className="relative rounded-lg overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs group aspect-video"
                      >
                        <img src={pic.previewUrl} alt="Preview" className="w-full h-full object-cover" />

                        {pic.isUploading ? (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
                            <Loader2 className="w-4 h-4 animate-spin mb-1 text-primary" />
                            <span className="text-[10px] font-mono">{pic.progress}%</span>
                          </div>
                        ) : pic.error ? (
                          <div className="absolute inset-0 bg-rose-900/80 flex items-center justify-center text-white p-1 text-[9px] text-center">
                            {pic.error}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveUploadedPicture(pic.id);
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] truncate px-1 font-mono">
                          {pic.file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External URLs Textarea */}
              <div className="pt-2 border-t border-border-subtle/60">
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Hoặc dán URL liên kết ngoài (nếu có):
                </label>
                <textarea
                  name="pictureUrls"
                  rows={2}
                  value={formData.pictureUrls || ''}
                  onChange={handleChange}
                  placeholder="e.g., https://example.com/defect1.jpg, https://example.com/defect2.jpg..."
                  className="w-full px-3 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-[11px]"
                />
              </div>
            </div>


            {/* Footer */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
