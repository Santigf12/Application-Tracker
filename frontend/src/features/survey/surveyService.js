import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/surveys/"; // lets us use the backend server in local development
} else {
  API_URL = "/api/surveys/";
}

const postApplication = async (data) => {
    try {
        const response = await axios.post(API_URL + "application", data);
        console.log("response from axios", response);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const postConsent = async (data) => {
    try {
        const response = await axios.post(API_URL + "consent", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const postPreworkshop = async (data) => {
    try {
        const response = await axios.post(API_URL + "preworkshop", data);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

const postPostworkshop = async (data) => {
    try {
        const response = await axios.post(API_URL + "postworkshop", data);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

const postFollowup = async (data) => {
    try {
        const response = await axios.post(API_URL + "followup", data);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

const surveyService = { postApplication, postConsent, postPreworkshop, postPostworkshop, postFollowup };

export default surveyService;