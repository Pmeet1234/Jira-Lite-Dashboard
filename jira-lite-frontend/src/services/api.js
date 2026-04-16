import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:3001";

const API = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
});

export default API;
