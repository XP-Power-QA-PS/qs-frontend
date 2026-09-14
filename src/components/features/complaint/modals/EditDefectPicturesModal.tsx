import React from 'react';
import { Image as ImageIcon, X, Save } from 'lucide-react';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';

interface EditDefectPicturesModalProps {
  isOpen: boolean;
  complaint: ComplaintDetail | null;
  pictureUrls: string;
  isSaving: boolean;
  onClose: () => void;
  onUrlsChange: (urls: string) => void;
  onSave: () => void;
  parsePictureUrls: (urls?: string) => string[];
}

export const EditDefectPicturesModal: React.FC<EditDefectPicturesModalProps> = ({
  isOpen,
  complaint,
  pictureUrls,
  isSaving,
  onClose,
  onUrlsChange,
  onSave,
  parsePictureUrls,
}) => {
  if (!isOpen || !complaint) return null;

  const validUrls = parsePictureUrls(pictureUrls);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Update Complaint Defect Images
              </h3>
              <p className="text-[11px] text-text-muted">
                Case: #{complaint.id} • {complaint.trackingNo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-text-secondary">
              Defect Picture URLs:
            </label>
            <textarea
              rows={4}
              value={pictureUrls}
              onChange={(e) => onUrlsChange(e.target.value)}
              placeholder="Paste defect picture URLs (multiple URLs supported, separated by newlines or commas):&#10;https://example.com/defect1.jpg&#10;https://example.com/defect2.png"
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-text-muted">
              Direct links from internal image servers, Google Drive, network NAS, or data URIs are supported.
            </p>
          </div>

          {/* Preview strip */}
          {validUrls.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-text-secondary block">
                Preview ({validUrls.length} valid picture(s)):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {validUrls.map((url, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border-subtle bg-surface-canvas relative"
                  >
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Picture URLs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
