import { getErrorMessage } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  getCoverLetter,
  saveCoverLetter,
  updateApplication,
} from "./api";
import type { Application, SaveCoverLetterPayload, UpdateApplicationPayload } from "./types";

const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: () => [...applicationKeys.lists()] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  coverLetter: (id: string) => [...applicationKeys.all, "cover-letter", id] as const,
};

export const useApplications = () => {
  return useQuery({
    queryKey: applicationKeys.list(),
    queryFn: getAllApplications,
  });
};

export const useApplication = (id: string, enabled = true) => {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: enabled && !!id,
  });
};

export const useCoverLetter = (id: string, enabled = true) => {
  return useQuery({
    queryKey: applicationKeys.coverLetter(id),
    queryFn: () => getCoverLetter(id),
    enabled: enabled && !!id,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: Application) => createApplication(application),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, application }: UpdateApplicationPayload) => updateApplication({ id, application }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(variables.id),
      });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.removeQueries({ queryKey: applicationKeys.detail(id) });
      queryClient.removeQueries({ queryKey: applicationKeys.coverLetter(id) });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useSaveCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: SaveCoverLetterPayload) => saveCoverLetter({ id, content }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.coverLetter(variables.id),
      });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export { applicationKeys, getErrorMessage };
