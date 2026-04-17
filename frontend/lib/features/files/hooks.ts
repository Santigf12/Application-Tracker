import { getErrorMessage } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteFile,
  fetchCoverLetterFile,
  fetchMergeFile,
  getCoverLetterTemplate,
  getOtherFiles,
  getResumeFiles,
  uploadCoverLetterTemplate,
  uploadOtherFiles,
  uploadResumeFile,
} from "./api";

import type {
  CoverLetterFilePayload,
  MergeFilePayload,
  UploadCoverLetterTemplatePayload,
  UploadOtherFilePayload,
  UploadResumePayload,
} from "./types";

const fileKeys = {
  all: ["files"] as const,
  resume: () => [...fileKeys.all, "resume"] as const,
  coverLetterTemplate: () => [...fileKeys.all, "cover-letter-template"] as const,
  other: () => [...fileKeys.all, "other"] as const,
};

export const useResumeFiles = () => {
  return useQuery({
    queryKey: fileKeys.resume(),
    queryFn: getResumeFiles,
  });
};

export const useCoverLetterTemplateFiles = () => {
  return useQuery({
    queryKey: fileKeys.coverLetterTemplate(),
    queryFn: getCoverLetterTemplate,
  });
};

export const useOtherFiles = () => {
  return useQuery({
    queryKey: fileKeys.other(),
    queryFn: getOtherFiles,
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file, onUploadProgress }: UploadResumePayload) => uploadResumeFile({ id, file, onUploadProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.resume() });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUploadCoverLetterTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onUploadProgress }: UploadCoverLetterTemplatePayload) => uploadCoverLetterTemplate({ file, onUploadProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fileKeys.coverLetterTemplate(),
      });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUploadOtherFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file, onUploadProgress }: UploadOtherFilePayload) => uploadOtherFiles({ id, file, onUploadProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.other() });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useCoverLetterFile = () => {
  return useMutation({
    mutationFn: ({ id, email, company, content }: CoverLetterFilePayload) => fetchCoverLetterFile({ id, email, company, content }),
    meta: {
      getErrorMessage,
    },
  });
};

export const useMergeFile = () => {
  return useMutation({
    mutationFn: ({ coverletter, email, company, content }: MergeFilePayload) => fetchMergeFile({ coverletter, email, company, content }),
    meta: {
      getErrorMessage,
    },
  });
};

export { fileKeys, getErrorMessage };
