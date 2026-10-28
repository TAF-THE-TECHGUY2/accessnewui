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

// An expired or revoked session: back to sign-in rather than a page of
// failed requests. Sign-in requests answer for their own reasons.
investorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Two-factor is required until set up or declined; the API answers this
    // code until then, so send them to decide.
    if (
      error?.response?.status === 403 &&
      error.response.data?.code === "two_factor_setup_required" &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/security/two-factor"
    ) {
      window.location.assign("/security/two-factor");
    }

    const url = error?.config?.url || "";
    if (
      error?.response?.status === 401 &&
      !/\/login(\/|$)/.test(url) &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      setInvestorAuthToken(null);
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
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
