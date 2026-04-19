import { getErrorMessage } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
  updateSkillGroup,
} from "./api";
import type {
  Experience,
  Project,
  Skill,
  SkillGroup,
  UpdateExperiencePayload,
  UpdateProjectPayload,
  UpdateSkillGroupPayload,
  UpdateSkillPayload,
} from "./types";

const profileKeys = {
  all: ["profile"] as const,

  full: () => [...profileKeys.all, "full"] as const,

  skillGroups: () => [...profileKeys.all, "skill-groups"] as const,
  skills: () => [...profileKeys.all, "skills"] as const,

  experiences: () => [...profileKeys.all, "experiences"] as const,
  experienceDetail: (id: string) => [...profileKeys.experiences(), id] as const,

  projects: () => [...profileKeys.all, "projects"] as const,
  projectDetail: (id: string) => [...profileKeys.projects(), id] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.full(),
    queryFn: getProfile,
  });
};

export const useSkillGroups = () => {
  return useQuery({
    queryKey: profileKeys.skillGroups(),
    queryFn: getSkillGroups,
  });
};

export const useSkills = () => {
  return useQuery({
    queryKey: profileKeys.skills(),
    queryFn: getSkills,
  });
};

export const useExperiences = () => {
  return useQuery({
    queryKey: profileKeys.experiences(),
    queryFn: getExperiences,
  });
};

export const useExperience = (id: string, enabled = true) => {
  return useQuery({
    queryKey: profileKeys.experienceDetail(id),
    queryFn: () => getExperienceById(id),
    enabled: enabled && !!id,
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: profileKeys.projects(),
    queryFn: getProjects,
  });
};

export const useProject = (id: string, enabled = true) => {
  return useQuery({
    queryKey: profileKeys.projectDetail(id),
    queryFn: () => getProjectById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateSkillGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skillGroup: SkillGroup) => createSkillGroup(skillGroup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUpdateSkillGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, skillGroup }: UpdateSkillGroupPayload) => updateSkillGroup({ id, skillGroup }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteSkillGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSkillGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skill: Skill) => createSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, skill }: UpdateSkillPayload) => updateSkill({ id, skill }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experience: Experience) => createExperience(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, experience }: UpdateExperiencePayload) => updateExperience({ id, experience }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.experienceDetail(variables.id),
      });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExperience(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.removeQueries({ queryKey: profileKeys.experienceDetail(id) });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: UpdateProjectPayload) => updateProject({ id, project }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.projectDetail(variables.id),
      });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.removeQueries({ queryKey: profileKeys.projectDetail(id) });
    },
    meta: {
      getErrorMessage,
    },
  });
};

export { getErrorMessage, profileKeys };
