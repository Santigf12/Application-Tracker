import axios from "axios";

let API_URL = "";
if (process.env.NODE_ENV !== "production") {
  API_URL = "http://localhost:5000/api/members/"; // lets us use the backend server in local development
}
else {
  API_URL = "/api/members/";
}

// GET all Members
const getAll = async (token) => {
  const { data } = await axios.get(API_URL);
  return data;
};
// GET all Members for a specific group
const getMembers = async (id) => {
  const { data } = await axios.get(API_URL + id);
  return data;
};

//Get member by id
const getMember = async (id) => {
  const { data } = await axios.get(API_URL + "indiv/" + id);
  return data;
};

//get Application for a specific member
const getApplication = async (id) => {

  const { data } = await axios.get(API_URL + "application/" + id);
  return data;
}

//get Consent for a specific member
const getConsent = async (id) => {
  const { data } = await axios.get(API_URL + "consent/" + id);
  return data;
}

const memberService = { getAll, getMembers, getApplication, getMember, getConsent };

export default memberService;
