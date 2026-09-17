import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Edit3,
  Maximize2,
  ExternalLink,
  Save,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ComplaintDetail, ComplaintUpdateRequest } from '@/types/complaint/complaint.types';

const defaultParsePictureUrls = (urls?: string): string[] => {
  if (!urls) return [];
  return urls
    .split(/[\n,;]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));
};

interface ComplaintInfoTabProps {
  complaint: ComplaintDetail;
  isUpdating?: boolean;
  onUpdate?: (payload: ComplaintUpdateRequest, successMessage: string) => Promise<boolean | void>;
  parsePictureUrls?: (urls?: string) => string[];
  onOpenEditPictures: () => void;
  onPreviewImage: (url: string) => void;
}

export const ComplaintInfoTab: React.FC<ComplaintInfoTabProps> = ({
  complaint,
  isUpdating = false,
  onUpdate,
  parsePictureUrls = defaultParsePictureUrls,
  onOpenEditPictures,
  onPreviewImage,
}) => {
  const pictureUrls = parsePictureUrls(complaint.pictureUrls);
  const isClosed = complaint.status === 'CLOSED';

  // 1. Defect & Product Information Edit State
  const [isEditingDefect, setIsEditingDefect] = useState(false);
  const [defectForm, setDefectForm] = useState({
    customerName: complaint.customerName || '',
    receivedDate: complaint.receivedDate || '',
    model: complaint.model || '',
    defectCategory: complaint.defectCategory || 'Cosmetic',
    defectName: complaint.defectName || '',
    quantity: complaint.quantity || 1,
    area: complaint.area || '',
    assignedTeam: complaint.assignedTeam || 'CFT Quality',
    assignedPerson: complaint.assignedPerson || '',
    assignmentDeadline: complaint.assignmentDeadline || '',
    issueDescription: complaint.issueDescription || '',
    customerFinding: complaint.customerFinding || '',
    serialNumbers: complaint.serialNumbers || '',
  });

  // 2. Identification & Timeline Edit State
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    capaNo: complaint.capaNo || '',
    salesforceCapa: complaint.salesforceCapa || '',
    buildingStage: complaint.buildingStage || 'MP',
    internalExternal: complaint.internalExternal || 'EXTERNAL',
    originOfComplaint: complaint.originOfComplaint || 'Customer',
  });

  // Sync state when complaint prop changes
  useEffect(() => {
    setDefectForm({
      customerName: complaint.customerName || '',
      receivedDate: complaint.receivedDate || '',
      model: complaint.model || '',
      defectCategory: complaint.defectCategory || 'Cosmetic',
      defectName: complaint.defectName || '',
      quantity: complaint.quantity || 1,
      area: complaint.area || '',
      assignedTeam: complaint.assignedTeam || 'CFT Quality',
      assignedPerson: complaint.assignedPerson || '',
      assignmentDeadline: complaint.assignmentDeadline || '',
      issueDescription: complaint.issueDescription || '',
      customerFinding: complaint.customerFinding || '',
      serialNumbers: complaint.serialNumbers || '',
    });

    setMetaForm({
      capaNo: complaint.capaNo || '',
      salesforceCapa: complaint.salesforceCapa || '',
      buildingStage: complaint.buildingStage || 'MP',
      internalExternal: complaint.internalExternal || 'EXTERNAL',
      originOfComplaint: complaint.originOfComplaint || 'Customer',
    });
  }, [complaint]);

  const handleCancelDefect = () => {
    setDefectForm({
      customerName: complaint.customerName || '',
      receivedDate: complaint.receivedDate || '',
      model: complaint.model || '',
      defectCategory: complaint.defectCategory || 'Cosmetic',
      defectName: complaint.defectName || '',
      quantity: complaint.quantity || 1,
      area: complaint.area || '',
      assignedTeam: complaint.assignedTeam || 'CFT Quality',
      assignedPerson: complaint.assignedPerson || '',
      assignmentDeadline: complaint.assignmentDeadline || '',
      issueDescription: complaint.issueDescription || '',
      customerFinding: complaint.customerFinding || '',
      serialNumbers: complaint.serialNumbers || '',
    });
    setIsEditingDefect(false);
  };

  const handleSaveDefect = async () => {
    if (!onUpdate) return;
    if (!defectForm.model.trim()) {
      toast.error('Product model is required.');
      return;
    }
    if (!defectForm.issueDescription.trim()) {
      toast.error('Issue description is required.');
      return;
    }

    const payload: ComplaintUpdateRequest = {
      customerName: defectForm.customerName.trim() || undefined,
      receivedDate: defectForm.receivedDate || undefined,
      model: defectForm.model.trim(),
      defectCategory: defectForm.defectCategory || undefined,
      defectName: defectForm.defectName.trim() || undefined,
      quantity: defectForm.quantity || 1,
      area: defectForm.area.trim() || undefined,
      assignedTeam: defectForm.assignedTeam.trim() || undefined,
      assignedPerson: defectForm.assignedPerson.trim() || undefined,
      assignmentDeadline: defectForm.assignmentDeadline || undefined,
      issueDescription: defectForm.issueDescription.trim(),
      customerFinding: defectForm.customerFinding.trim() || undefined,
      serialNumbers: defectForm.serialNumbers.trim() || undefined,
    };

    const res = await onUpdate(payload, 'Defect & product information updated successfully!');
    if (res !== false) {
      setIsEditingDefect(false);
    }
  };

  const handleCancelMeta = () => {
    setMetaForm({
      capaNo: complaint.capaNo || '',
      salesforceCapa: complaint.salesforceCapa || '',
      buildingStage: complaint.buildingStage || 'MP',
      internalExternal: complaint.internalExternal || 'EXTERNAL',
      originOfComplaint: complaint.originOfComplaint || 'Customer',
    });
    setIsEditingMeta(false);
  };

  const handleSaveMeta = async () => {
    if (!onUpdate) return;
    const payload: ComplaintUpdateRequest = {
      capaNo: metaForm.capaNo.trim() || undefined,
      salesforceCapa: metaForm.salesforceCapa.trim() || undefined,
      buildingStage: metaForm.buildingStage || undefined,
      internalExternal: metaForm.internalExternal as any,
      originOfComplaint: metaForm.originOfComplaint.trim() || undefined,
    };

    const res = await onUpdate(payload, 'Identification & classification updated successfully!');
    if (res !== false) {
      setIsEditingMeta(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1 & 2: Primary Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Group 1: Defect & Product Information */}
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {isEditingDefect ? 'Edit Defect & Product Information' : 'Defect & Product Information'}
            </h3>
            {!isClosed && onUpdate && (
              !isEditingDefect ? (
                <button
                  type="button"
                  onClick={() => setIsEditingDefect(true)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelDefect}
                    disabled={isUpdating}
                    className="px-2.5 py-1 text-xs text-text-muted hover:text-text-primary font-medium rounded-lg hover:bg-surface-canvas transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDefect}
                    disabled={isUpdating || !defectForm.model.trim() || !defectForm.issueDescription.trim()}
                    className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              )
            )}
          </div>

          {!isEditingDefect ? (
            /* VIEW MODE */
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3.5 bg-surface-canvas rounded-xl text-xs">
                <div>
                  <span className="text-text-muted text-[11px] block">Customer Name</span>
                  <strong className="text-text-primary">{complaint.customerName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Received Date</span>
                  <strong className="text-text-primary">{complaint.receivedDate || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Model</span>
                  <strong className="text-text-primary font-mono">{complaint.model}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Defect Category</span>
                  <strong className="text-text-primary">{complaint.defectCategory || 'Uncategorized'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Defect Name</span>
                  <strong className="text-rose-600">{complaint.defectName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Affected Quantity</span>
                  <strong className="text-text-primary">{complaint.quantity || 1} EA</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Area</span>
                  <strong className="text-text-primary">{complaint.area || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Assigned Team</span>
                  <strong className="text-text-primary">{complaint.assignedTeam || 'CFT Quality'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Responsible Lead</span>
                  <strong className="text-text-primary">{complaint.assignedPerson || 'Unassigned'}</strong>
                </div>
                <div>
                  <span className="text-text-muted text-[11px] block">Assignment SLA</span>
                  <span className="text-indigo-800 font-semibold">{complaint.assignmentDeadline || '1 Day'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-text-secondary block mb-1">
                  Issue Description:
                </span>
                <p className="text-xs text-text-primary bg-surface-canvas p-3 rounded-xl leading-relaxed whitespace-pre-wrap border border-border-subtle">
                  {complaint.issueDescription}
                </p>
              </div>

              {complaint.customerFinding && (
                <div>
                  <span className="text-xs font-semibold text-text-secondary block mb-1">
                    Customer Finding / Feedback:
                  </span>
                  <p className="text-xs text-text-primary bg-amber-50/50 p-3 rounded-xl leading-relaxed border border-amber-200/50">
                    {complaint.customerFinding}
                  </p>
                </div>
              )}

              {complaint.serialNumbers && (
                <div>
                  <span className="text-[11px] font-semibold text-text-muted block mb-0.5">
                    SN:
                  </span>
                  <code className="text-xs bg-surface-canvas px-2.5 py-1 rounded-md border border-border-subtle block font-mono">
                    {complaint.serialNumbers}
                  </code>
                </div>
              )}
            </>
          ) : (
            /* EDIT MODE */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-canvas p-4 rounded-xl border border-border-subtle">
                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={defectForm.customerName}
                    onChange={(e) => setDefectForm({ ...defectForm, customerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Customer Name"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Received Date
                  </label>
                  <input
                    type="date"
                    value={defectForm.receivedDate}
                    onChange={(e) => setDefectForm({ ...defectForm, receivedDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-medium text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={defectForm.model}
                    onChange={(e) => setDefectForm({ ...defectForm, model: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-mono font-bold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Model (e.g. mk-456)"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Defect Category
                  </label>
                  <select
                    value={defectForm.defectCategory}
                    onChange={(e) => setDefectForm({ ...defectForm, defectCategory: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Cosmetic">Cosmetic</option>
                    <option value="Functional">Functional</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Dimensional">Dimensional</option>
                    <option value="Missing Parts">Missing Parts</option>
                    <option value="Software / Firmware">Software / Firmware</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Defect Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={defectForm.defectName}
                    onChange={(e) => setDefectForm({ ...defectForm, defectName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-bold text-rose-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Defect Name"
                    required
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Affected Quantity (EA)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defectForm.quantity}
                    onChange={(e) => setDefectForm({ ...defectForm, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-bold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Area / Line
                  </label>
                  <input
                    type="text"
                    value={defectForm.area}
                    onChange={(e) => setDefectForm({ ...defectForm, area: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Production Line, SMT"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Assigned Team
                  </label>
                  <input
                    type="text"
                    value={defectForm.assignedTeam}
                    onChange={(e) => setDefectForm({ ...defectForm, assignedTeam: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. CFT Quality"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Responsible Lead
                  </label>
                  <input
                    type="text"
                    value={defectForm.assignedPerson}
                    onChange={(e) => setDefectForm({ ...defectForm, assignedPerson: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. Quality Engineer"
                  />
                </div>

                <div>
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Assignment SLA / Deadline
                  </label>
                  <input
                    type="date"
                    value={defectForm.assignmentDeadline}
                    onChange={(e) => setDefectForm({ ...defectForm, assignmentDeadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-indigo-800 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-text-muted text-[11px] block font-medium mb-1">
                    Serial Numbers (SN)
                  </label>
                  <input
                    type="text"
                    value={defectForm.serialNumbers}
                    onChange={(e) => setDefectForm({ ...defectForm, serialNumbers: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-subtle rounded-lg text-xs font-mono text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    placeholder="e.g. SN12345, SN12346..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Issue Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={defectForm.issueDescription}
                  onChange={(e) => setDefectForm({ ...defectForm, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-xs text-text-primary leading-relaxed focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Detailed defect description, symptoms, and failure conditions..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Customer Finding / Initial Feedback
                </label>
                <textarea
                  rows={2}
                  value={defectForm.customerFinding}
                  onChange={(e) => setDefectForm({ ...defectForm, customerFinding: e.target.value })}
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-text-primary leading-relaxed focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  placeholder="Notes, observations, or initial feedback provided by customer or inspector..."
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <span className="text-[11px] text-text-muted italic">
                  Fields marked with <strong className="text-rose-500">*</strong> are mandatory.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelDefect}
                    disabled={isUpdating}
                    className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary font-medium rounded-xl hover:bg-surface-canvas transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDefect}
                    disabled={isUpdating || !defectForm.model.trim() || !defectForm.issueDescription.trim()}
                    className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Group: Defect Pictures */}
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Defect Pictures & Evidence
              {pictureUrls.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {pictureUrls.length} photos
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={onOpenEditPictures}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {pictureUrls.length > 0 ? 'Update photo URLs' : 'Add photo URLs'}
            </button>
          </div>

          {pictureUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pictureUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onPreviewImage(url)}
                >
                  <img
                    src={url}
                    alt={`Defect photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-1.5 bg-white/90 text-slate-800 rounded-lg shadow-xs hover:bg-white transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={onOpenEditPictures}
              className="p-6 border-2 border-dashed border-border-subtle rounded-xl text-center bg-surface-canvas/50 hover:bg-surface-canvas transition-colors cursor-pointer space-y-1.5"
            >
              <ImageIcon className="w-7 h-7 text-text-muted mx-auto" />
              <p className="text-xs font-semibold text-text-secondary">No defect images attached yet</p>
              <p className="text-[11px] text-text-muted">
                Click here to paste direct image links or defect inspection photo URLs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Col 3: Metadata & Identification */}
      <div className="space-y-6">
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {isEditingMeta ? 'Edit Identification' : 'Identification & Timeline'}
            </h3>
            {!isClosed && onUpdate && (
              !isEditingMeta ? (
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(true)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancelMeta}
                    disabled={isUpdating}
                    className="px-2 py-0.5 text-xs text-text-muted hover:text-text-primary font-medium rounded-lg hover:bg-surface-canvas transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMeta}
                    disabled={isUpdating}
                    className="px-2.5 py-0.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                </div>
              )
            )}
          </div>

          {!isEditingMeta ? (
            /* VIEW METADATA MODE */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Tracking No:</span>
                <span className="font-mono font-bold text-primary">{complaint.trackingNo}</span>
              </div>
              {complaint.capaNo && (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">CAPA No:</span>
                  <span className="font-mono font-bold text-purple-700">{complaint.capaNo}</span>
                </div>
              )}
              {complaint.salesforceCapa && (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Salesforce CAPA:</span>
                  <span className="font-mono font-bold text-indigo-700">{complaint.salesforceCapa}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Assigned Team:</span>
                <span className="font-semibold text-text-primary">{complaint.assignedTeam || 'CFT Quality'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Responsible Lead:</span>
                <span className="font-semibold text-text-primary">{complaint.assignedPerson || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Effectiveness:</span>
                <span className={`font-semibold ${
                  complaint.effectivenessStatus === 'EFFECTIVE'
                    ? 'text-emerald-600'
                    : complaint.effectivenessStatus === 'NOT_EFFECTIVE'
                    ? 'text-rose-600'
                    : 'text-amber-600'
                }`}>
                  {complaint.effectivenessStatus || 'PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Year / Month:</span>
                <span className="font-semibold text-text-primary">Year {complaint.year} (Month {complaint.month})</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Week:</span>
                <span className="font-semibold text-text-primary">Week #{complaint.week || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Stage:</span>
                <span className="font-semibold text-text-primary">{complaint.buildingStage || 'MP'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Classification:</span>
                <span className="font-semibold text-text-primary">{complaint.internalExternal}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Origin of Complaint:</span>
                <span className="font-semibold text-text-primary">{complaint.originOfComplaint || 'Customer'}</span>
              </div>
              {isClosed ? (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Ageing Closed:</span>
                  <span className="font-semibold text-emerald-600">
                    {complaint.ageingClosed != null ? `${complaint.ageingClosed} days` : '-'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Ageing Open:</span>
                  <span className="font-semibold text-amber-600">
                    {complaint.ageingOpen != null ? `${complaint.ageingOpen} days` : '-'}
                  </span>
                </div>
              )}
              {complaint.closureDate && (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Closure Date:</span>
                  <span className="font-semibold text-emerald-600">{complaint.closureDate}</span>
                </div>
              )}
              {complaint.finalStatus && (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Final Status:</span>
                  <span className="font-semibold text-emerald-700">{complaint.finalStatus}</span>
                </div>
              )}
              {complaint.remarks && (
                <div className="py-1 border-b border-border-subtle text-xs">
                  <span className="text-text-muted block text-[11px] mb-0.5">Closure Remarks:</span>
                  <span className="text-text-secondary bg-surface-canvas p-2 rounded-lg border border-border-subtle block text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                    {complaint.remarks}
                  </span>
                </div>
              )}
              {complaint.finalEvidence && (
                <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Final Evidence:</span>
                  {complaint.finalEvidence.startsWith('http') ? (
                    <a href={complaint.finalEvidence} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-[120px]">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      Link
                    </a>
                  ) : (
                    <span className="font-semibold text-text-primary truncate max-w-[120px]" title={complaint.finalEvidence}>
                      {complaint.finalEvidence}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Created By:</span>
                <span className="font-semibold text-text-primary">{complaint.createdBy}</span>
              </div>
            </div>
          ) : (
            /* EDIT METADATA MODE */
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  Tracking No (System ID)
                </label>
                <div className="px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-mono font-bold text-text-muted">
                  {complaint.trackingNo}
                </div>
              </div>

              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  CAPA No
                </label>
                <input
                  type="text"
                  value={metaForm.capaNo}
                  onChange={(e) => setMetaForm({ ...metaForm, capaNo: e.target.value })}
                  placeholder="e.g. CAPA-2026-001"
                  className="w-full px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-mono font-bold text-purple-800 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  Salesforce CAPA No
                </label>
                <input
                  type="text"
                  value={metaForm.salesforceCapa}
                  onChange={(e) => setMetaForm({ ...metaForm, salesforceCapa: e.target.value })}
                  placeholder="e.g. SF-12345"
                  className="w-full px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-mono font-bold text-indigo-800 focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  Building Stage
                </label>
                <select
                  value={metaForm.buildingStage}
                  onChange={(e) => setMetaForm({ ...metaForm, buildingStage: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                >
                  <option value="MP">MP (Mass Production)</option>
                  <option value="PVT">PVT (Production Validation)</option>
                  <option value="DVT">DVT (Design Validation)</option>
                  <option value="EVT">EVT (Engineering Validation)</option>
                  <option value="Pilot">Pilot / Prototype</option>
                </select>
              </div>

              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  Classification
                </label>
                <select
                  value={metaForm.internalExternal}
                  onChange={(e) => setMetaForm({ ...metaForm, internalExternal: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                >
                  <option value="EXTERNAL">EXTERNAL (Customer)</option>
                  <option value="INTERNAL">INTERNAL (In-house)</option>
                </select>
              </div>

              <div>
                <label className="text-text-muted text-[11px] block font-medium mb-1">
                  Origin of Complaint
                </label>
                <input
                  type="text"
                  value={metaForm.originOfComplaint}
                  onChange={(e) => setMetaForm({ ...metaForm, originOfComplaint: e.target.value })}
                  placeholder="e.g. Customer, Internal Audit"
                  className="w-full px-2.5 py-1.5 bg-surface-canvas border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCancelMeta}
                  disabled={isUpdating}
                  className="px-2.5 py-1 text-xs text-text-muted hover:text-text-primary font-medium rounded-lg hover:bg-surface-canvas transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMeta}
                  disabled={isUpdating}
                  className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
