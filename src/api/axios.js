import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_PRODUCTION_API
    : import.meta.env.VITE_LOCAL_API,

  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export default api;