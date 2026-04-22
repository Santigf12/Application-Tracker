import { api } from "@/lib/api";
import type {
  GenerateCoverLetterPayload,
  GenerateResumePayload,
  JobPostingContent,
  ScrapePostingPayload,
  TailorProfilePayload,
  TailoredProfileResponse,
} from "./types";

const TOOLS_PATH = "/tools";
const RESUME_PATH = "/resume";

const getCoverLetterContent = async ({ company, position, jobPosting }: GenerateCoverLetterPayload): Promise<string> => {
  const { data } = await api.post(`${TOOLS_PATH}/cover-letter`, {
    company,
    position,
    jobPosting,
  });

  return data.content;
};

const getJobPostingContent = async ({ url }: ScrapePostingPayload): Promise<JobPostingContent> => {
  const { data } = await api.post(`${TOOLS_PATH}/scrape-posting`, { url });
  return data;
};

const getTailoredProfile = async ({ company, position, jobPosting }: TailorProfilePayload): Promise<TailoredProfileResponse> => {
  const { data } = await api.post(`${TOOLS_PATH}/tailor-profile`, {
    company,
    position,
    jobPosting,
  });

  return data;
};

const generateResumeDocx = async (payload?: GenerateResumePayload): Promise<Blob> => {
  const { data } = await api.post(`${RESUME_PATH}/generate`, payload ?? {}, {
    responseType: "blob",
  });

  return data;
};

export { generateResumeDocx, getCoverLetterContent, getJobPostingContent, getTailoredProfile };

