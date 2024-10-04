import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/applications/"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/applications/";
}

// GET all applications
const getAllApplications = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
};

//Get application by ID
const getApplicationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
};

//Create application
const createApplication = async (application) => {
  try {
    const response = await axios.post(API_URL, application);
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
}


const memberService = { getAllApplications, createApplication, getApplicationById };

export default memberService;
