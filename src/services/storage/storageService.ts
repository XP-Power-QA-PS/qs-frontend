import { apiClient } from '@/config/api';
import type {
  FileCommitRequest,
  FileCommitResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
  UploadProgressCallback,
} from '@/types/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const storageService = {
  /**
   * Bước 1: Xin presigned PUT URL từ backend để upload file vào thư mục tmp/
   */
  getPresignedUploadUrl: async (request: PresignedUploadRequest): Promise<PresignedUploadResponse> => {
    return apiClient(`${BASE_URL}/v1/files/presigned-upload`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Bước 2: Tải trực tiếp file lên MinIO thông qua Presigned PUT URL
   * Sử dụng XMLHttpRequest để theo dõi tiến độ upload (upload progress bar).
   */
  uploadToMinio: (
    uploadUrl: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      // Cần set Content-Type trùng khớp với Content-Type đã ký trong presigned URL
      const contentType = file.type || 'application/octet-stream';
      xhr.setRequestHeader('Content-Type', contentType);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent, event.loaded, event.total);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Tải file lên MinIO thất bại với mã lỗi HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Lỗi kết nối mạng khi tải file lên máy chủ lưu trữ (MinIO).'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Quá thời gian tải file lên máy chủ lưu trữ.'));
      };

      xhr.send(file);
    });
  },

  /**
   * Bước 3 (Tùy chọn): Xác nhận và chuyển file từ tmp/ sang thư mục lưu trữ chính thức ngay lập tức
   */
  commitFile: async (request: FileCommitRequest): Promise<FileCommitResponse> => {
    return apiClient(`${BASE_URL}/v1/files/commit`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Lấy đường dẫn tải bảo mật (Presigned GET URL)
   */
  getPresignedDownloadUrl: async (objectKey: string, expirationMinutes = 15): Promise<string> => {
    const data = await apiClient(
      `${BASE_URL}/v1/files/presigned-download?objectKey=${encodeURIComponent(objectKey)}&expirationMinutes=${expirationMinutes}`
    );
    return data.downloadUrl;
  },

  /**
   * Xóa file khỏi hệ thống lưu trữ
   */
  deleteFile: async (objectKey: string): Promise<void> => {
    return apiClient(`${BASE_URL}/v1/files?objectKey=${encodeURIComponent(objectKey)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Hàm tiện ích tích hợp đầy đủ: Xin link -> Upload lên tmp/ -> Copy sang thư mục đích
   */
  uploadAndCommit: async (
    file: File,
    targetFolder: string,
    options?: {
      category?: string;
      targetFileName?: string;
      onProgress?: UploadProgressCallback;
    }
  ): Promise<FileCommitResponse> => {
    // 1. Xin presigned URL
    const presigned = await storageService.getPresignedUploadUrl({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      fileSize: file.size,
      category: options?.category,
    });

    // 2. Upload file trực tiếp lên MinIO (tmp/)
    await storageService.uploadToMinio(presigned.uploadUrl, file, options?.onProgress);

    // 3. Commit file sang thư mục đích
    return await storageService.commitFile({
      tmpKey: presigned.tmpKey,
      targetFolder,
      targetFileName: options?.targetFileName,
    });
  },
};
