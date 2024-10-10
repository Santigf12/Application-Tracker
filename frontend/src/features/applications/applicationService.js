import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/applications"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/applications";
}

// GET all applications
const getAllApplications = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

//Get application by ID
const getApplicationById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

//Create application
const createApplication = async (application) => {
  const { data } = await axios.post(API_URL, application);
  return data;
}

//Update application
const updateApplication = async (id, application) => {
  const { data }  = await axios.put(`${API_URL}/${id}`, application);
  return data;
}

//Delete application
const deleteApplication = async (id) => {
  const { data }  = await axios.delete(`${API_URL}/${id}`);
  return data;
}

const saveCoverLetter = async (id, content) => {
  const { data }  = await axios.post(`${API_URL}/${id}`, { content });
  return data;
};

const getCoverLetter = async (id) => {
  const { data } = await axios.get(`${API_URL}/cover-letter/${id}`);
  return data;
}


const applicationService = { 
  getAllApplications, 
  createApplication, 
  getApplicationById,
  updateApplication,
  deleteApplication,
  saveCoverLetter,
  getCoverLetter
};

export default applicationService;
