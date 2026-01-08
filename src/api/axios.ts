import axios from "axios";
// const LOCAL_FASTAPI_URL=import.meta.env.VITE_LOCAL_FASTAPI_URL;
const DEP_FASTAPI_URL=import.meta.env.VITE_DEP_FASTAPI_URL;
const api = axios.create({
  baseURL: DEP_FASTAPI_URL,
});

// Attach JWT ONLY for protected routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Public routes (no auth, no noise)
  const publicPaths = [
    "/flights/stripe/webhook",
    "/flights/select",
    "/auth/login",
    "/auth/signup",
  ];

  const isPublic = publicPaths.some((path) =>
    config.url?.startsWith(path)
  );

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
