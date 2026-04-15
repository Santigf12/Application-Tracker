// src/features/tools/types.ts

export interface JobPostingContent {
  title: string;
  company: string;
  location: string;
  length: string;
  posting: string;
  url: string;
}

export interface GenerateCoverLetterPayload {
  company: string;
  jobPosting: string;
}

export interface ScrapePostingPayload {
  url: string;
}
