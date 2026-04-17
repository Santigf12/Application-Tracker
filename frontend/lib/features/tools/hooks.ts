import { getErrorMessage } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { getCoverLetterContent, getJobPostingContent } from "./api";
import type { GenerateCoverLetterPayload, ScrapePostingPayload } from "./types";

export const useGenerateCoverLetter = () => {
  return useMutation({
    mutationFn: ({ company, position, jobPosting }: GenerateCoverLetterPayload) => getCoverLetterContent({ company, position, jobPosting }),
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
