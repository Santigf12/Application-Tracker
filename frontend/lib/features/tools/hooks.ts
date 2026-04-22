import { getErrorMessage } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { generateResumeDocx, getCoverLetterContent, getJobPostingContent, getTailoredProfile } from "./api";
import type { GenerateCoverLetterPayload, GenerateResumePayload, ScrapePostingPayload, TailorProfilePayload } from "./types";

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

export const useTailorProfile = () => {
  return useMutation({
    mutationFn: ({ company, position, jobPosting }: TailorProfilePayload) => getTailoredProfile({ company, position, jobPosting }),
    meta: {
      getErrorMessage,
    },
  });
};

export const useGenerateResume = () => {
  return useMutation({
    mutationFn: (payload?: GenerateResumePayload) => generateResumeDocx(payload),
    meta: {
      getErrorMessage,
    },
  });
};
