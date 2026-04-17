export type FileStatus = "error" | "done" | "uploading" | "removed";

export interface FileItem {
  uid: string;
  name: string;
  status?: FileStatus;
  percent?: number;
  type?: string;
  filePath?: string;
}

export interface UploadResumePayload {
  id: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export interface UploadOtherFilePayload {
  id: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export interface UploadCoverLetterTemplatePayload {
  file: File;
  onUploadProgress?: (progress: number) => void;
}

export interface CoverLetterFilePayload {
  id: string;
  email: string;
  company: string;
  content: string;
}

export interface MergeFilePayload {
  coverletter: boolean;
  email?: string;
  company?: string;
  content?: string;
}
