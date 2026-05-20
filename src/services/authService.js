import api, { setAuthToken } from "./api";

export const login = async ({ email, password }) => {
  const { data } = await api.post("/login", { email, password });
  setAuthToken(data.token);
  return data.user;
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } finally {
    setAuthToken(null);
  }
};

export const me = async () => {
  const { data } = await api.get("/me");
  return data.user;
};
