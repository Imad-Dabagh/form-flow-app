export interface UploadedFile {
  id: string;
  storageKey: string;
  provider: string;
  url: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  checksum?: string;
  createdAt: string;
}

export interface UploadFileInput {
  file: File;
}
