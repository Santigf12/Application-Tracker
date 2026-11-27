import { getErrorMessage } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteFile,
  fetchCoverLetterFile,
  fetchMergeFile,
  getCoverLetterTemplate,
  getOtherFiles,
  uploadCoverLetterTemplate,
  uploadOtherFiles,
} from "./api";

import type { CoverLetterFilePayload, MergeFilePayload, UploadCoverLetterTemplatePayload, UploadOtherFilePayload } from "./types";

const fileKeys = {
  all: ["files"] as const,
  resume: () => [...fileKeys.all, "resume"] as const,
  coverLetterTemplate: () => [...fileKeys.all, "cover-letter-template"] as const,
  other: () => [...fileKeys.all, "other"] as const,
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
    mutationFn: ({ id, coverletter, email, company, content }: MergeFilePayload) => fetchMergeFile({ id, coverletter, email, company, content }),
    meta: {
      getErrorMessage,
    },
  });
};

export { fileKeys, getErrorMessage };
