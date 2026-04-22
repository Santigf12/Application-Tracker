import type { GenerateResumePayload } from "@/lib/features/tools/types";

export interface Application {
  id?: string;
  title: string;
  company: string;
  location: string;
  posting: string;
  added: string;
  applied: string;
  coverletter?: boolean;
  resume?: boolean;
  status: string;
  length: string;
  url: string;
}

export interface SaveCoverLetterPayload {
  id: string;
  content: string;
}

export interface SaveResumePayload {
  id: string;
  include_publications: boolean;
  manifest: GenerateResumePayload;
}

export interface SavedResumeResponse {
  include_publications: boolean;
  manifest: GenerateResumePayload;
}

export interface UpdateApplicationPayload {
  id: string;
  application: Application;
}
