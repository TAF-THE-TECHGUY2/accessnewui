import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_LARAVEL_API_URL ||
  "https://laravel-api.accessproperties.test/api/admin";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const setAuthToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem("access_admin_token", token);
  } else {
    window.localStorage.removeItem("access_admin_token");
  }
};

export default api;
