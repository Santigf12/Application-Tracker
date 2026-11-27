import { api } from "@/lib/api";
import type { CoverLetterFilePayload, FileItem, MergeFilePayload, UploadOtherFilePayload } from "./types";

const FILES_PATH = "/pdf";

const toProgressPercent = (loaded: number, total?: number) => {
  if (!total || total <= 0) return 0;
  return Math.round((loaded * 100) / total);
};

const fetchCoverLetterFile = async ({ id, email, company, content }: CoverLetterFilePayload): Promise<Blob> => {
  const { data } = await api.post(`${FILES_PATH}/file-cover-letter`, { id, email, company, content }, { responseType: "blob" });
  return data;
};

const deleteFile = async (id: string): Promise<{ message: string; id: string }> => {
  const { data } = await api.delete(`${FILES_PATH}/delete-file?id=${encodeURIComponent(id)}`);
  return data;
};

const uploadOtherFiles = async ({ id, file, onUploadProgress }: UploadOtherFilePayload): Promise<FileItem> => {
  const formData = new FormData();
  formData.append("other-files", file);

  const { data } = await api.post(`${FILES_PATH}/upload-other-files?id=${encodeURIComponent(id)}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      onUploadProgress?.(toProgressPercent(progressEvent.loaded, progressEvent.total));
    },
  });

  return data;
};

const getOtherFiles = async (): Promise<FileItem[]> => {
  const { data } = await api.get(`${FILES_PATH}/other-files`);
  return data;
};

const fetchMergeFile = async ({ id, coverletter, email, company, content }: MergeFilePayload): Promise<Blob> => {
  const { data } = await api.post(`${FILES_PATH}/merged`, { id, coverletter, email, company, content }, { responseType: "blob" });
  return data;
};

export { deleteFile, fetchCoverLetterFile, fetchMergeFile, getOtherFiles, uploadOtherFiles };
