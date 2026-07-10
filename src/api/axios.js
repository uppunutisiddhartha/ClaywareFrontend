import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://clayware-1.onrender.com/api/"
    : "https://clayware-frontend.vercel.app/",
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