export interface Skill {
  id?: string;
  skill_group_id: string;
  name: string;
  position: number;
}

export interface SkillGroup {
  id?: string;
  title: string;
  position: number;
  skills?: Skill[];
}

export interface ExperienceBullet {
  id?: string;
  experience_id?: string;
  content: string;
  position: number;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  position: number;
  bullets: ExperienceBullet[];
}

export interface ProjectBullet {
  id?: string;
  project_id?: string;
  content: string;
  position: number;
}

export interface Project {
  id?: string;
  name: string;
  start_date: string;
  end_date: string;
  stack: string;
  links: string;
  description: string;
  position: number;
  bullets: ProjectBullet[];
}

export interface Profile {
  skill_groups: SkillGroup[];
  experiences: Experience[];
  projects: Project[];
}

export interface UpdateSkillGroupPayload {
  id: string;
  skillGroup: SkillGroup;
}

export interface UpdateSkillPayload {
  id: string;
  skill: Skill;
}

export interface UpdateExperiencePayload {
  id: string;
  experience: Experience;
}

export interface UpdateProjectPayload {
  id: string;
  project: Project;
}
