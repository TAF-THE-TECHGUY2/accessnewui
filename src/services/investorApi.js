import axios from "axios";

const ADMIN_API_BASE =
  import.meta.env.VITE_LARAVEL_API_URL ||
  "https://laravel-api.accessproperties.test/api/admin";

const API_BASE_URL =
  import.meta.env.VITE_LARAVEL_INVESTOR_API_URL ||
  ADMIN_API_BASE.replace(/\/admin\/?$/, "/investor");

const investorApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

investorApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_investor_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

investorApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const setInvestorAuthToken = (token) => {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem("access_investor_token", token);
  } else {
    window.localStorage.removeItem("access_investor_token");
  }
};

export const getInvestorAuthToken = () =>
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem("access_investor_token");

export default investorApi;
