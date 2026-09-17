import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  ClipboardPaste,
  FileSpreadsheet,
} from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import { storageService } from '@/services/storage';
import type { ComplaintCreateRequest, ComplaintDetail } from '@/types/complaint/complaint.types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const [submitIntent, setSubmitIntent] = useState<'SAVE' | 'SAVE_AND_MEET'>('SAVE');
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

  // Upload pictures to MinIO
  const uploadFiles = async (fileArray: File[]) => {
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

  const handlePictureFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  // Listen to clipboard paste (Ctrl + V) for images
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        toast.success(`Received ${files.length} image(s) from Clipboard! Uploading to MinIO...`);
        uploadFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleRemoveUploadedPicture = (id: string) => {
    setUploadedPictures((prev) => prev.filter((p) => p.id !== id));
  };

  // Count serial numbers from input
  const serialCount = (formData.serialNumbers || '')
    .split(/[\n,;\t]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;

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
      setErrorMessage('Please wait for all images to finish uploading to MinIO before saving.');
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

      if (submitIntent === 'SAVE_AND_MEET') {
        onClose();
        navigate(`/meeting-invite?complaintId=${result.id}`, {
          state: { complaint: result },
        });
      } else {
        toast.success(`Complaint case ${result.trackingNo} created successfully!`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create complaint case. Please try again.');
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

  if (!isOpen) return null;

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
                Customer Complaint Intake
              </h2>
              <p className="text-xs text-text-muted">
                Enter preliminary complaint information; sequential tracking number is generated automatically
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
                Complaint Intake Saved Successfully!
              </h3>
              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-mono font-bold text-base">
                Tracking No: {createdComplaint.trackingNo}
              </div>
              <p className="text-xs text-text-muted mt-2">
                Year: {createdComplaint.year} | Model: {createdComplaint.model} | Customer: {createdComplaint.customerName}
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-sky-900 font-semibold text-xs">
                <Calendar className="w-4 h-4 text-sky-600" />
                Next Step: Schedule CFT Review Meeting
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                Issue details, model, customer, and proposed meeting agenda are pre-populated. You can dispatch invitations and calendar (.ics) files to the cross-functional team now!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-xl transition-colors cursor-pointer"
              >
                Close & View Case
              </button>
              <button
                type="button"
                onClick={handleGoToMeeting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Schedule CFT Meeting Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Unable to save complaint:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* BLOCK 1: ORIGIN & TIMELINE */}
            <div className="p-4 bg-surface-canvas rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                1. Origin & Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Received Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    name="receivedDate"
                    value={formData.receivedDate}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Building Stage
                  </label>
                  <select
                    name="buildingStage"
                    value={formData.buildingStage}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                  >
                    <option value="MP">MP (Mass Production)</option>
                    <option value="Pilot">Pilot</option>
                    <option value="EVT">EVT</option>
                    <option value="DVT">DVT</option>
                    <option value="PVT">PVT</option>
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
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  >
                    <option value="Customer">Customer</option>
                    <option value="QA">QA / QC</option>
                    <option value="Production">Production</option>
                    <option value="Audit">Audit</option>
                    <option value="Field">Field Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Classification
                  </label>
                  <div className="flex bg-white rounded-xl border border-border-subtle p-0.5">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, internalExternal: 'EXTERNAL' }))}
                      className={`flex-1 py-1 rounded-lg text-center font-semibold text-[11px] transition-all cursor-pointer ${
                        formData.internalExternal === 'EXTERNAL'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      External
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, internalExternal: 'INTERNAL' }))}
                      className={`flex-1 py-1 rounded-lg text-center font-semibold text-[11px] transition-all cursor-pointer ${
                        formData.internalExternal === 'INTERNAL'
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Internal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 2: PRODUCT & DEFECT DETAILS */}
            <div className="p-4 bg-surface-canvas rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                2. Product & Defect Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Foxconn, Samsung, Intel..."
                    className="w-full px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Product Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. ABC-100, MD-550..."
                    className="w-full px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Defect Category
                  </label>
                  <select
                    name="defectCategory"
                    value={formData.defectCategory}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cosmetic">Cosmetic</option>
                    <option value="Functional">Functional</option>
                    <option value="Firmware">Firmware / Software</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Defect Name
                  </label>
                  <input
                    type="text"
                    name="defectName"
                    value={formData.defectName}
                    onChange={handleChange}
                    placeholder="e.g. Abnormal noise, Scratch..."
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Affected Qty (EA)
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, quantity: Math.max(1, (p.quantity || 1) - 1) }))
                      }
                      className="px-2.5 py-1.5 bg-white border border-border-subtle rounded-l-xl text-text-secondary hover:bg-surface-subtle"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      name="quantity"
                      value={formData.quantity || 1}
                      onChange={handleChange}
                      className="w-full text-center py-1.5 bg-white border-y border-border-subtle text-text-primary focus:outline-none text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, quantity: (p.quantity || 1) + 1 }))
                      }
                      className="px-2.5 py-1.5 bg-white border border-border-subtle rounded-r-xl text-text-secondary hover:bg-surface-subtle"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Area / Line
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. Assembly Line 2..."
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-text-secondary">
                    Serial Numbers (SN)
                  </label>
                  {serialCount > 0 && (
                    <span className="text-[10px] text-primary font-semibold">
                      {serialCount} serial(s) detected
                      {serialCount !== formData.quantity && (
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, quantity: serialCount }))}
                          className="ml-2 underline text-text-muted hover:text-primary cursor-pointer"
                        >
                          (Set Qty = {serialCount})
                        </button>
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  name="serialNumbers"
                  value={formData.serialNumbers}
                  onChange={handleChange}
                  placeholder="Paste serial numbers separated by commas, tabs or spaces (e.g. SN001, SN002, SN003...)"
                  className="w-full px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                />
              </div>
            </div>

            {/* BLOCK 3: DESCRIPTION & DEFECT PHOTOS */}
            <div className="p-4 bg-surface-canvas rounded-2xl border border-border-subtle space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                3. Description & Defect Photos
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Issue Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe defect symptoms, failure circumstances, and affected scope in detail..."
                  className="w-full px-3 py-2 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs leading-relaxed resize-y"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Customer Finding / Initial Feedback
                </label>
                <input
                  type="text"
                  name="customerFinding"
                  value={formData.customerFinding}
                  onChange={handleChange}
                  placeholder="e.g. Customer observed abnormal vibration during initial line run..."
                  className="w-full px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                />
              </div>

              {/* MinIO Upload Area with Clipboard Paste support */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-secondary">
                    Defect Images & Visual Evidence
                  </span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <ClipboardPaste className="w-3 h-3 text-primary" />
                    Clipboard image paste supported (Ctrl + V)
                  </span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-subtle hover:border-primary/50 bg-white hover:bg-surface-subtle/40 rounded-xl p-3.5 text-center cursor-pointer transition-colors space-y-1"
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
                    <span className="text-xs font-semibold">Click to upload images or press Ctrl + V</span>
                  </div>
                  <p className="text-[10px] text-text-muted">Automatically stored in MinIO (PNG, JPG, WEBP)</p>
                </div>

                {/* Uploaded pictures thumbnails */}
                {uploadedPictures.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {uploadedPictures.map((pic) => (
                      <div
                        key={pic.id}
                        className="relative rounded-lg overflow-hidden border border-border-subtle bg-white shadow-2xs group aspect-video"
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
                            title="Remove picture"
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
                )}
              </div>
            </div>

            {/* Footer Buttons: Dual CTA */}
            <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-secondary bg-surface-subtle hover:bg-border-subtle rounded-xl transition-colors cursor-pointer order-2 sm:order-1"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5 order-1 sm:order-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => setSubmitIntent('SAVE')}
                  className="px-4 py-2.5 text-xs font-semibold text-text-primary bg-white hover:bg-surface-canvas border border-border-subtle rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && submitIntent === 'SAVE' ? 'Saving...' : 'Save Draft Intake'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => setSubmitIntent('SAVE_AND_MEET')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && submitIntent === 'SAVE_AND_MEET' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  ★ Save & Schedule Meeting →
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
