import axios from 'axios';

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/pdf/"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/pdf/";
}


const fetchCoverLetterFile = async (id, email, company, content) => {
    const response = await axios.post(`${API_URL}/file-cover-letter`,
        {id, email, company, content }, 
        { responseType: 'blob' } // Important for downloading binary data like files
    );
    return response.data;
};

const fileService = {
    fetchCoverLetterFile,
};

export default fileService;
