import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/tools"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/tools";
}

// GET cover letter content
const getCoverLetterContent = async (company: any, jobPosting: any) => {
  const { data } = await axios.post(`${API_URL}/cover-letter`, { company, jobPosting });
  return data;
};

// GET job posting content from scraping
const getJobPostingContent = async (url: any) => {
  const { data } = await axios.post(`${API_URL}/scrape-posting`, { url });
  return data;
  
};

const toolsService = {
  getCoverLetterContent,
  getJobPostingContent,
};

export default toolsService;