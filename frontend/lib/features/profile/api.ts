import { api } from "@/lib/api";
import type {
  Experience,
  Profile,
  Project,
  Skill,
  SkillGroup,
  UpdateExperiencePayload,
  UpdateProjectPayload,
  UpdateSkillGroupPayload,
  UpdateSkillPayload,
} from "./types";

const PROFILE_PATH = "/profile";

const getProfile = async (): Promise<Profile> => {
  const { data } = await api.get(`${PROFILE_PATH}/`);
  return data;
};

const getSkillGroups = async (): Promise<SkillGroup[]> => {
  const { data } = await api.get(`${PROFILE_PATH}/skill-groups`);
  return data;
};

const createSkillGroup = async (skillGroup: SkillGroup): Promise<SkillGroup | { success: boolean; message: string }> => {
  const { data } = await api.post(`${PROFILE_PATH}/skill-groups`, skillGroup);
  return data;
};

const updateSkillGroup = async ({ id, skillGroup }: UpdateSkillGroupPayload): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.put(`${PROFILE_PATH}/skill-groups/${id}`, skillGroup);
  return data;
};

const deleteSkillGroup = async (id: string): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await api.delete(`${PROFILE_PATH}/skill-groups/${id}`);
  return data;
};

const getSkills = async (): Promise<Skill[]> => {
  const { data } = await api.get(`${PROFILE_PATH}/skills`);
  return data;
};

const createSkill = async (skill: Skill): Promise<Skill | { success: boolean; message: string }> => {
  const { data } = await api.post(`${PROFILE_PATH}/skills`, skill);
  return data;
};

const updateSkill = async ({ id, skill }: UpdateSkillPayload): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.put(`${PROFILE_PATH}/skills/${id}`, skill);
  return data;
};

const deleteSkill = async (id: string): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await api.delete(`${PROFILE_PATH}/skills/${id}`);
  return data;
};

const getExperiences = async (): Promise<Experience[]> => {
  const { data } = await api.get(`${PROFILE_PATH}/experiences`);
  return data;
};

const getExperienceById = async (id: string): Promise<Experience> => {
  const { data } = await api.get(`${PROFILE_PATH}/experiences/${id}`);
  return data;
};

const createExperience = async (experience: Experience): Promise<Experience | { success: boolean; message: string }> => {
  const { data } = await api.post(`${PROFILE_PATH}/experiences`, experience);
  return data;
};

const updateExperience = async ({ id, experience }: UpdateExperiencePayload): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.put(`${PROFILE_PATH}/experiences/${id}`, experience);
  return data;
};

const deleteExperience = async (id: string): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await api.delete(`${PROFILE_PATH}/experiences/${id}`);
  return data;
};

const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get(`${PROFILE_PATH}/projects`);
  return data;
};

const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await api.get(`${PROFILE_PATH}/projects/${id}`);
  return data;
};

const createProject = async (project: Project): Promise<Project | { success: boolean; message: string }> => {
  const { data } = await api.post(`${PROFILE_PATH}/projects`, project);
  return data;
};

const updateProject = async ({ id, project }: UpdateProjectPayload): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.put(`${PROFILE_PATH}/projects/${id}`, project);
  return data;
};

const deleteProject = async (id: string): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await api.delete(`${PROFILE_PATH}/projects/${id}`);
  return data;
};

export {
  createExperience,
  createProject,
  createSkill,
  createSkillGroup,
  deleteExperience,
  deleteProject,
  deleteSkill,
  deleteSkillGroup,
  getExperienceById,
  getExperiences,
  getProfile,
  getProjectById,
  getProjects,
  getSkillGroups,
  getSkills,
  updateExperience,
  updateProject,
  updateSkill,
  updateSkillGroup
};

