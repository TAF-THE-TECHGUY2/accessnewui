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

// Two-factor is required for admins. Until it is set up the API answers
// every admin endpoint but setup with this code, so send them there.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 403 &&
      error.response.data?.code === "two_factor_setup_required" &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/admin/two-factor"
    ) {
      window.location.assign("/admin/two-factor");
    }

    // An expired or revoked session. Sign-in requests answer 401 for their
    // own reasons and are left to the page.
    const url = error?.config?.url || "";
    if (
      error?.response?.status === 401 &&
      !/\/login(\/|$)/.test(url) &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/admin/login"
    ) {
      setAuthToken(null);
      window.location.assign("/admin/login");
    }

    return Promise.reject(error);
  }
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
