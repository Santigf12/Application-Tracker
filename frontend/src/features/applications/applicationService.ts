import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/applications"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/applications";
}

import { Application } from "./applicationsSlice";

// GET all applications
const getAllApplications = async (): Promise<Application[]> => {
  const { data } = await axios.get(API_URL);
  return data;
};

//Get application by ID
const getApplicationById = async (id: string): Promise<Application> => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

//Create application
const createApplication = async (application: Application) => {
  const { data } = await axios.post(API_URL, application);
  return data;
}

//Update application
const updateApplication = async (id: string, application: Application) => {
  const { data }  = await axios.put(`${API_URL}/${id}`, application);
  return data;
}

//Delete application
const deleteApplication = async (id: string) => {
  const { data }  = await axios.delete(`${API_URL}/${id}`);
  return data;
}

const saveCoverLetter = async (id: string, content: string) => {
  const { data }  = await axios.post(`${API_URL}/${id}`, { content });
  return data;
};

const getCoverLetter = async (id: string) => {
  const { data } = await axios.get(`${API_URL}/cover-letter/${id}`);
  return data;
}

const applicationService = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  saveCoverLetter,
  getCoverLetter
};

export default applicationService;
