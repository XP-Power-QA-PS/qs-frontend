export interface PresignedUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  category?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  tmpKey: string;
  expiresInMinutes: number;
}

export interface FileCommitRequest {
  tmpKey: string;
  targetFolder: string;
  targetFileName?: string;
}

export interface FileCommitResponse {
  objectKey: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

export interface UploadProgressCallback {
  (percent: number, loaded: number, total: number): void;
}
