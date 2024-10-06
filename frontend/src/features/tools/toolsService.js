import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/tools"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/tools";
}

// GET cover letter content
const getCoverLetterContent = async (company, jobPosting) => {
  try {
    const response = await axios.post(`${API_URL}/cover-letter`, { company, jobPosting });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
};

// GET job posting content from scraping
const getJobPostingContent = async (url) => {
  try {
    const response = await axios.post(`${API_URL}/scrape-posting`, { url });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
};

const toolsService = {
  getCoverLetterContent,
  getJobPostingContent,
};

export default toolsService;