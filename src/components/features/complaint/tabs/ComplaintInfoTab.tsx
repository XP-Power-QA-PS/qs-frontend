import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Edit3,
  Maximize2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';

interface ComplaintInfoTabProps {
  complaint: ComplaintDetail;
  parsePictureUrls: (urls?: string) => string[];
  onOpenEditPictures: () => void;
  onPreviewImage: (url: string) => void;
  onNavigateToActions: () => void;
}

export const ComplaintInfoTab: React.FC<ComplaintInfoTabProps> = ({
  complaint,
  parsePictureUrls,
  onOpenEditPictures,
  onPreviewImage,
  onNavigateToActions,
}) => {
  const pictureUrls = parsePictureUrls(complaint.pictureUrls);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1 & 2: Primary Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Group 1 & 4: Issue Description & Defect */}
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Defect & Product Information
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-surface-canvas rounded-xl text-xs">
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

        {/* Group 5: Root Cause & CAPA Actions */}
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Corrective & Preventive Action Plan (CAPA / 8D)
            </h3>
            <button
              onClick={onNavigateToActions}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Edit / Update Actions
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Containment */}
            <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-text-primary">1. Containment Action (Interim Containment - D3):</strong>
                <span className="text-[11px] text-text-muted">
                  Due: {complaint.containmentDueDate || 'SLA 2 days'}
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {complaint.containmentAction || 'Not updated yet (Click "8D Stage-Gate" tab to record)'}
              </p>
              {(complaint.containmentOwner || complaint.containmentCompletionDate || complaint.containmentStatus) && (
                <div className="mt-2 pt-2 border-t border-border-subtle flex flex-wrap gap-3 text-[11px] text-text-muted">
                  {complaint.containmentOwner && <span>Owner: <strong className="text-text-primary">{complaint.containmentOwner}</strong></span>}
                  {complaint.containmentCompletionDate && <span>Completed: <strong className="text-text-primary">{complaint.containmentCompletionDate}</strong></span>}
                  {complaint.containmentStatus && <span>Status: <strong className="text-blue-700">{complaint.containmentStatus}</strong></span>}
                </div>
              )}
            </div>

            {/* Root Cause */}
            <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-text-primary">2. Root Cause Analysis (5-Why - D4):</strong>
                <span className="text-[11px] text-text-muted">SLA: 5 days</span>
              </div>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {complaint.rootCause || 'Under investigation... (Click "8D Stage-Gate" tab to record)'}
              </p>
              {(complaint.rootCauseCategory || complaint.rootCauseOwner || complaint.rootCauseCompletionDate) && (
                <div className="mt-2 pt-2 border-t border-border-subtle flex flex-wrap gap-3 text-[11px] text-text-muted">
                  {complaint.rootCauseCategory && <span>Category: <strong className="text-indigo-700">{complaint.rootCauseCategory}</strong></span>}
                  {complaint.rootCauseOwner && <span>Lead: <strong className="text-text-primary">{complaint.rootCauseOwner}</strong></span>}
                  {complaint.rootCauseCompletionDate && <span>Completed: <strong className="text-text-primary">{complaint.rootCauseCompletionDate}</strong></span>}
                </div>
              )}
            </div>

            {/* CAPA Plan */}
            <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-text-primary flex items-center gap-2">
                  3. Corrective & Preventive Action (CAPA - D5 & D6):
                  {complaint.capaNo && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                      {complaint.capaNo}
                    </span>
                  )}
                </strong>
                <span className="text-[11px] text-text-muted">
                  Due: {complaint.actionDueDate || 'SLA 10 days'}
                </span>
              </div>

              {complaint.correctiveAction || complaint.preventiveAction ? (
                <div className="space-y-1.5 pt-1">
                  {complaint.correctiveAction && (
                    <div className="text-xs">
                      <span className="text-[11px] font-bold text-purple-900 block">Corrective Action:</span>
                      <p className="text-text-secondary whitespace-pre-wrap">{complaint.correctiveAction}</p>
                    </div>
                  )}
                  {complaint.preventiveAction && (
                    <div className="text-xs">
                      <span className="text-[11px] font-bold text-indigo-900 block">Preventive Action (Yokoten):</span>
                      <p className="text-text-secondary whitespace-pre-wrap">{complaint.preventiveAction}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {complaint.correctivePreventiveAction || 'Awaiting root cause verification'}
                </p>
              )}

              {(complaint.actionOwner || complaint.capaCompletionDate || complaint.actionStatus) && (
                <div className="mt-2 pt-2 border-t border-border-subtle flex flex-wrap gap-3 text-[11px] text-text-muted">
                  {complaint.actionOwner && <span>Owner: <strong className="text-text-primary">{complaint.actionOwner}</strong></span>}
                  {complaint.capaCompletionDate && <span>Completed: <strong className="text-text-primary">{complaint.capaCompletionDate}</strong></span>}
                  {complaint.actionStatus && <span>Status: <strong className="text-purple-700">{complaint.actionStatus}</strong></span>}
                </div>
              )}
            </div>

            {/* 30-Day Effectiveness */}
            <div className="p-3.5 border border-border-subtle rounded-xl bg-surface-canvas">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-text-primary">4. 30-Day Effectiveness Verification (D7):</strong>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  complaint.effectivenessStatus === 'EFFECTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : complaint.effectivenessStatus === 'NOT_EFFECTIVE'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {complaint.effectivenessStatus || 'PENDING'}
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {complaint.effectivenessRemarks || 'Observation window ongoing. Zero defects required over 30 days.'}
              </p>
              {(complaint.effectivenessVerifiedBy || complaint.effectivenessVerifiedDate) && (
                <div className="mt-2 pt-2 border-t border-border-subtle flex flex-wrap gap-3 text-[11px] text-text-muted">
                  {complaint.effectivenessVerifiedBy && <span>Verified By: <strong className="text-text-primary">{complaint.effectivenessVerifiedBy}</strong></span>}
                  {complaint.effectivenessVerifiedDate && <span>Audit Date: <strong className="text-text-primary">{complaint.effectivenessVerifiedDate}</strong></span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Metadata & Identification */}
      <div className="space-y-6">
        <div className="bg-white border border-border-subtle p-5 rounded-2xl shadow-2xs space-y-3.5 text-xs">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Identification & Timeline
          </h3>

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
              <span className="text-text-muted">Priority:</span>
              <span className="font-semibold text-text-primary">{complaint.priority || 'MEDIUM'}</span>
            </div>
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
            <div className="flex items-center justify-between py-1 border-b border-border-subtle">
              <span className="text-text-muted">Ageing Open:</span>
              <span className="font-semibold text-amber-600">
                {complaint.ageingOpen != null ? `${complaint.ageingOpen} days` : '-'}
              </span>
            </div>
            {complaint.closureDate && (
              <div className="flex items-center justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Closure Date:</span>
                <span className="font-semibold text-emerald-600">{complaint.closureDate}</span>
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
        </div>
      </div>
    </div>
  );
};
