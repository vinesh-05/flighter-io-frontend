import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI URL
});

// Attach JWT in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
