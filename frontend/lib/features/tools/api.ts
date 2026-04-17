import { api } from "@/lib/api";
import type { GenerateCoverLetterPayload, JobPostingContent, ScrapePostingPayload } from "./types";

const TOOLS_PATH = "/tools";

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

export { getCoverLetterContent, getJobPostingContent };
