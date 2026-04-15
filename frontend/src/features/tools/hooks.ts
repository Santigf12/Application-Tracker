// src/features/tools/hooks.ts

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { getCoverLetterContent, getJobPostingContent } from './api';
import type { GenerateCoverLetterPayload, ScrapePostingPayload } from './types';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Request failed'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An error occurred';
};

export const useGenerateCoverLetter = () => {
  return useMutation({
    mutationFn: ({ company, jobPosting }: GenerateCoverLetterPayload) =>
      getCoverLetterContent({ company, jobPosting }),
    meta: {
      getErrorMessage,
    },
  });
};

export const useScrapePosting = () => {
  return useMutation({
    mutationFn: ({ url }: ScrapePostingPayload) => getJobPostingContent({ url }),
    meta: {
      getErrorMessage,
    },
  });
};

export { getErrorMessage };
