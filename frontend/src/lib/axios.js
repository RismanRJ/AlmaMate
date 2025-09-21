import axios from "axios";

const BASE_URL = "http://localhost:3500/almaHub";
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
// http://localhost:3500/almaHub/auth/checkAuth
