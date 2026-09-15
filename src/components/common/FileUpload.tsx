import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2, FileText } from 'lucide-react';
import { storageService } from '@/services/storage';
import type { FileCommitResponse } from '@/types/storage';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMb?: number;
  category?: string;
  targetFolder?: string;
  autoCommit?: boolean;
  onUploadSuccess?: (result: { tmpKey?: string; committed?: FileCommitResponse; file: File }) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Tải tệp tin hoặc hình ảnh',
  accept = 'image/*,application/pdf',
  maxSizeMb = 20,
  category = 'general',
  targetFolder,
  autoCommit = false,
  onUploadSuccess,
  onUploadError,
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setErrorMessage(null);
    setIsSuccess(false);

    // 1. Kiểm tra dung lượng
    if (selectedFile.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`Dung lượng tệp (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn cho phép (${maxSizeMb}MB).`);
      return;
    }

    setFile(selectedFile);

    // 2. Tạo preview nếu là hình ảnh
    if (selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    // 3. Bắt đầu upload
    setIsUploading(true);
    setProgress(0);

    try {
      if (autoCommit && targetFolder) {
        // Tự động chuyển sang thư mục đích sau khi tải lên tmp thành công
        const commitRes = await storageService.uploadAndCommit(selectedFile, targetFolder, {
          category,
          onProgress: (percent) => setProgress(percent),
        });
        setIsSuccess(true);
        onUploadSuccess?.({ committed: commitRes, file: selectedFile });
      } else {
        // Tải lên tmp/ và lấy tmpKey để form nghiệp vụ commit sau
        const presigned = await storageService.getPresignedUploadUrl({
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
          category,
        });

        await storageService.uploadToMinio(presigned.uploadUrl, selectedFile, (percent) => {
          setProgress(percent);
        });

        setIsSuccess(true);
        onUploadSuccess?.({ tmpKey: presigned.tmpKey, file: selectedFile });
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Tải file lên thất bại');
      setErrorMessage(error.message);
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setIsSuccess(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}

      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800'
        } ${isUploading ? 'cursor-not-allowed opacity-90' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          disabled={isUploading}
        />

        {/* Trạng thái xem trước hoặc file đã chọn */}
        {file ? (
          <div className="flex flex-col items-center space-y-3">
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Xem trước"
                  className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                />
                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                    title="Xóa tệp"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <FileText className="w-7 h-7" />
                {!isUploading && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                    title="Xóa tệp"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className="text-sm">
              <p className="font-semibold text-gray-800 dark:text-gray-200 max-w-xs truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>

            {/* Thanh tiến trình upload */}
            {isUploading && (
              <div className="w-full max-w-xs space-y-1.5">
                <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải lên MinIO...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Thành công */}
            {isSuccess && !isUploading && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tải lên thành công!
              </div>
            )}
          </div>
        ) : (
          /* Trạng thái chưa chọn file */
          <div className="flex flex-col items-center space-y-2.5 py-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Nhấp để chọn tệp hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Định dạng hỗ trợ: {accept} (Tối đa {maxSizeMb}MB)
              </p>
            </div>
          </div>
        )}

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
