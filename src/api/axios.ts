import axios from "axios";

const api = axios.create({
  baseURL: "https://flighter-io-production.up.railway.app",
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
