// src/features/files/api.ts

import axios from 'axios';
import type {
    CoverLetterFilePayload,
    FileItem,
    MergeFilePayload,
    UploadCoverLetterTemplatePayload,
    UploadOtherFilePayload,
    UploadResumePayload,
} from './types';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api/pdf' : '/api/pdf';

const filesApi = axios.create({
  baseURL: API_URL,
});

const toProgressPercent = (loaded: number, total?: number) => {
  if (!total || total <= 0) return 0;
  return Math.round((loaded * 100) / total);
};

const fetchCoverLetterFile = async ({
  id,
  email,
  company,
  content,
}: CoverLetterFilePayload): Promise<Blob> => {
  const { data } = await filesApi.post(
    '/file-cover-letter',
    { id, email, company, content },
    { responseType: 'blob' },
  );
  return data;
};

const uploadResumeFile = async ({
  id,
  file,
  onUploadProgress,
}: UploadResumePayload): Promise<FileItem> => {
  const formData = new FormData();
  formData.append('resume-file', file);

  const { data } = await filesApi.post(`/upload-resume?id=${encodeURIComponent(id)}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      onUploadProgress?.(toProgressPercent(progressEvent.loaded, progressEvent.total));
    },
  });

  return data;
};

const uploadCoverLetterTemplate = async ({
  file,
  onUploadProgress,
}: UploadCoverLetterTemplatePayload): Promise<FileItem> => {
  const formData = new FormData();
  formData.append('cover-letter-template', file);

  const { data } = await filesApi.post('/upload-cover-letter-template', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      onUploadProgress?.(toProgressPercent(progressEvent.loaded, progressEvent.total));
    },
  });

  return data;
};

const getResumeFiles = async (): Promise<FileItem[]> => {
  const { data } = await filesApi.get('/resume-files');
  return data;
};

const deleteFile = async (id: string): Promise<{ message: string; id: string }> => {
  const { data } = await filesApi.delete(`/delete-file?id=${encodeURIComponent(id)}`);
  return data;
};

const getCoverLetterTemplate = async (): Promise<FileItem[]> => {
  const { data } = await filesApi.get('/cover-letter-template');
  return data;
};

const uploadOtherFiles = async ({
  id,
  file,
  onUploadProgress,
}: UploadOtherFilePayload): Promise<FileItem> => {
  const formData = new FormData();
  formData.append('other-files', file);

  const { data } = await filesApi.post(
    `/upload-other-files?id=${encodeURIComponent(id)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        onUploadProgress?.(toProgressPercent(progressEvent.loaded, progressEvent.total));
      },
    },
  );

  return data;
};

const getOtherFiles = async (): Promise<FileItem[]> => {
  const { data } = await filesApi.get('/other-files');
  return data;
};

const fetchMergeFile = async ({
  coverletter,
  email,
  company,
  content,
}: MergeFilePayload): Promise<Blob> => {
  const { data } = await filesApi.post(
    '/merged',
    { coverletter, email, company, content },
    { responseType: 'blob' },
  );
  return data;
};

export {
    deleteFile,
    fetchCoverLetterFile,
    fetchMergeFile,
    getCoverLetterTemplate,
    getOtherFiles,
    getResumeFiles,
    uploadCoverLetterTemplate,
    uploadOtherFiles,
    uploadResumeFile
};

