// src/features/applications/api.ts

import axios from 'axios';
import type { Application, SaveCoverLetterPayload, UpdateApplicationPayload } from './types';

const API_URL = import.meta.env.DEV
  ? 'http://localhost:5000/api/applications'
  : '/api/applications';

const applicationApi = axios.create({
  baseURL: API_URL,
});

const getAllApplications = async (): Promise<Application[]> => {
  const { data } = await applicationApi.get('/');
  return data;
};

const getApplicationById = async (id: string): Promise<Application> => {
  const { data } = await applicationApi.get(`/${id}`);
  return data;
};

const createApplication = async (
  application: Application,
): Promise<Application | { success: boolean; message: string }> => {
  const { data } = await applicationApi.post('/', application);
  return data;
};

const updateApplication = async ({
  id,
  application,
}: UpdateApplicationPayload): Promise<Application> => {
  const { data } = await applicationApi.put(`/${id}`, application);
  return data;
};

const deleteApplication = async (
  id: string,
): Promise<{ success?: boolean; message: string; id?: string }> => {
  const { data } = await applicationApi.delete(`/${id}`);
  return data;
};

const saveCoverLetter = async ({
  id,
  content,
}: SaveCoverLetterPayload): Promise<{ success?: boolean; message: string }> => {
  const { data } = await applicationApi.post(`/${id}`, { content });
  return data;
};

const getCoverLetter = async (id: string): Promise<string> => {
  const { data } = await applicationApi.get(`/cover-letter/${id}`);
  return data;
};

export {
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  getCoverLetter,
  saveCoverLetter,
  updateApplication
};

