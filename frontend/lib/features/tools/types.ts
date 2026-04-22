import type { Profile } from "@/lib/features/profile/types";

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

export type TailorProfilePayload = {
  company?: string;
  position: string;
  jobPosting: string;
};

export interface EducationItem {
  degree: string;
  institution: string;
  date: string;
}

export interface PublicationItem {
  citation: string;
  url: string;
}

export interface TailoredProfileResponse extends Profile {
  education: EducationItem[];
  publications: PublicationItem[];
  meta: {
    position: string;
    company?: string;
    include_publication: boolean;
    notes: string;
    model: string;
  };
}

export interface SkillGroupManifest {
  id: string;
  skills: string[];
}

export interface ExperienceManifest {
  id: string;
  bullets: string[];
}

export interface ProjectManifest {
  id: string;
  include?: boolean;
  bullets: string[];
}

export interface GenerateResumePayload {
  skill_groups?: SkillGroupManifest[];
  experiences?: ExperienceManifest[];
  projects?: ProjectManifest[];
  include_publications?: boolean;
}
