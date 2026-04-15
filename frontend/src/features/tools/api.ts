// src/features/tools/api.ts

import axios from 'axios';
import type { GenerateCoverLetterPayload, JobPostingContent, ScrapePostingPayload } from './types';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api/tools' : '/api/tools';

const toolsApi = axios.create({
  baseURL: API_URL,
});

const getCoverLetterContent = async ({
  company,
  position,
  jobPosting,
}: GenerateCoverLetterPayload): Promise<string> => {
  const { data } = await toolsApi.post('/cover-letter', {
    company,
    position,
    jobPosting,
  });

  return data.content;
};

const getJobPostingContent = async ({ url }: ScrapePostingPayload): Promise<JobPostingContent> => {
  const { data } = await toolsApi.post('/scrape-posting', { url });
  return data;
};

export { getCoverLetterContent, getJobPostingContent };
