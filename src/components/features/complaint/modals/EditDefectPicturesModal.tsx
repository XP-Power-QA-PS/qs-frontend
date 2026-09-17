import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, X, Save, AlertCircle, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { complaintService } from '@/services/complaint/complaintService';
import { storageService } from '@/services/storage';
import type { ComplaintDetail } from '@/types/complaint/complaint.types';

export interface EditDefectPicturesModalProps {
  isOpen: boolean;
  complaint: ComplaintDetail | null;
  onClose: () => void;
  onSuccess: (updatedComplaint: ComplaintDetail) => void;
}

const parsePictureUrls = (urls?: string): string[] => {
  if (!urls) return [];
  return urls
    .split(/[\n,;]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));
};

interface NewUploadingPicture {
  id: string;
  file: File;
  previewUrl: string;
  tmpKey?: string;
  isUploading: boolean;
  progress: number;
  error?: string;
}

export const EditDefectPicturesModal: React.FC<EditDefectPicturesModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onSuccess,
}) => {
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [customUrlsText, setCustomUrlsText] = useState('');
  const [newPictures, setNewPictures] = useState<NewUploadingPicture[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (complaint && isOpen) {
      setExistingUrls(parsePictureUrls(complaint.pictureUrls));
      setCustomUrlsText('');
      setNewPictures([]);
      setErrorMessage(null);
    }
  }, [complaint, isOpen]);

  if (!isOpen || !complaint) return null;

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);

      const item: NewUploadingPicture = {
        id,
        file,
        previewUrl,
        isUploading: true,
        progress: 0,
      };

      setNewPictures((prev) => [...prev, item]);

      try {
        const presigned = await storageService.getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          fileSize: file.size,
          category: 'complaint',
        });

        await storageService.uploadToMinio(presigned.uploadUrl, file, (percent) => {
          setNewPictures((prev) =>
            prev.map((p) => (p.id === id ? { ...p, progress: percent } : p))
          );
        });

        setNewPictures((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isUploading: false, tmpKey: presigned.tmpKey } : p
          )
        );
      } catch (err: any) {
        setNewPictures((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isUploading: false, error: err.message || 'Image upload failed' } : p
          )
        );
      }
    }
  };

  const handleRemoveExistingUrl = (indexToRemove: number) => {
    setExistingUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewPicture = (id: string) => {
    setNewPictures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    const isAnyUploading = newPictures.some((p) => p.isUploading);
    if (isAnyUploading) {
      setErrorMessage('Please wait for all images to finish uploading to MinIO before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Combine existing URLs + newly entered manual URLs
      const additionalUrls = parsePictureUrls(customUrlsText);
      const allUrls = [...existingUrls, ...additionalUrls];

      // 2. Collect tmpKeys from new uploaded pictures
      const tmpKeys = newPictures.filter((p) => p.tmpKey).map((p) => p.tmpKey!);

      const updated = await complaintService.updateComplaint(complaint.id, {
        pictureUrls: allUrls.join('\n'),
        pictureTmpKeys: tmpKeys.length > 0 ? tmpKeys : undefined,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update complaint pictures. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-border-subtle w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Manage Defect Pictures (MinIO Storage)
              </h3>
              <p className="text-[11px] text-text-muted">
                Case: #{complaint.id} • Tracking No: <span className="font-mono font-semibold">{complaint.trackingNo}</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MinIO Upload Drag & Drop Zone */}
          <div className="space-y-2">
            <label className="block font-semibold text-text-secondary">
              Upload more defect photos from device / computer:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-subtle hover:border-primary/60 bg-surface-canvas/50 hover:bg-surface-canvas rounded-xl p-5 text-center cursor-pointer transition-colors space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFilesSelect(e.target.files)}
              />
              <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                <UploadCloud className="w-6 h-6" />
                <span>Click to select or drag and drop defect images here</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Images are uploaded directly to MinIO storage (`complaints/{complaint.year}/{complaint.trackingNo}/defects/`)
              </p>
            </div>
          </div>

          {/* Newly uploaded pictures preview */}
          {newPictures.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-text-secondary block">
                Newly uploaded pictures ({newPictures.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {newPictures.map((pic) => (
                  <div
                    key={pic.id}
                    className="relative rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs group aspect-video"
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
                        onClick={() => handleRemoveNewPicture(pic.id)}
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
            </div>
          )}

          {/* Existing Pictures Gallery */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-text-secondary block">
              Existing pictures in case ({existingUrls.length}):
            </span>
            {existingUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas shadow-2xs group aspect-video"
                  >
                    <img
                      src={url}
                      alt={`Defect ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingUrl(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer"
                      title="Delete picture from case"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-canvas/60 border border-border-subtle text-center text-text-muted text-[11px]">
                No defect images attached to this complaint case yet.
              </div>
            )}
          </div>

          {/* Optional External URLs textarea */}
          <div className="space-y-1.5 pt-3 border-t border-border-subtle">
            <label className="block font-semibold text-text-secondary">
              Or add external image URLs (optional):
            </label>
            <textarea
              rows={2}
              value={customUrlsText}
              onChange={(e) => setCustomUrlsText(e.target.value)}
              placeholder="Paste external image URLs separated by commas or line breaks..."
              className="w-full px-3 py-2 bg-surface-canvas border border-border-subtle rounded-xl text-text-primary text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-surface-canvas/40 border-t border-border-subtle flex items-center justify-end gap-2.5">
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
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Picture Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
