export interface JobPostingContent {
  title: string;
  company: string;
  location: string;
  length: string;
  posting: string;
  url: string;
}

export type GenerateCoverLetterPayload = {
  company: string;
  position: string;
  jobPosting: string;
};

export interface ScrapePostingPayload {
  url: string;
}
