import { api } from "@/lib/api";
import type { Application, SaveCoverLetterPayload, SaveResumePayload, SavedResumeResponse, UpdateApplicationPayload } from "./types";

const APPLICATIONS_PATH = "/applications";

const getAllApplications = async (): Promise<Application[]> => {
  const { data } = await api.get(`${APPLICATIONS_PATH}/`);
  return data;
};

const getApplicationById = async (id: string): Promise<Application> => {
  const { data } = await api.get(`${APPLICATIONS_PATH}/${id}`);
  return data;
};

const createApplication = async (application: Application): Promise<Application | { success: boolean; message: string }> => {
  const { data } = await api.post(`${APPLICATIONS_PATH}/`, application);
  return data;
};

const updateApplication = async ({ id, application }: UpdateApplicationPayload): Promise<Application> => {
  const { data } = await api.put(`${APPLICATIONS_PATH}/${id}`, application);
  return data;
};

const deleteApplication = async (id: string): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await api.delete(`${APPLICATIONS_PATH}/${id}`);
  return data;
};

const saveCoverLetter = async ({ id, content }: SaveCoverLetterPayload): Promise<{ success?: boolean; message: string }> => {
  const { data } = await api.post(`${APPLICATIONS_PATH}/${id}`, { content });
  return data;
};

const getCoverLetter = async (id: string): Promise<string> => {
  const { data } = await api.get(`${APPLICATIONS_PATH}/cover-letter/${id}`);
  return data;
};

const saveResume = async ({ id, include_publications, manifest }: SaveResumePayload): Promise<{ success?: boolean; message: string }> => {
  const { data } = await api.post(`${APPLICATIONS_PATH}/${id}/resume`, {
    include_publications,
    manifest,
  });
  return data;
};

const getResume = async (id: string): Promise<SavedResumeResponse | null> => {
  const { data } = await api.get(`${APPLICATIONS_PATH}/resume/${id}`);
  return data;
};

export {
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  getCoverLetter,
  getResume,
  saveCoverLetter,
  saveResume,
  updateApplication
};

