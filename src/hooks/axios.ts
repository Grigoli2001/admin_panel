import axios, { AxiosInstance } from "axios";

const API_URL = import.meta.env.BACKEND_URL || "http://localhost:8080";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export default api;
