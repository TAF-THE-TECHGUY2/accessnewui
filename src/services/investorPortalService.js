import investorApi, { setInvestorAuthToken } from "./investorApi";

export const login = async ({ email, password }) => {
  const { data } = await investorApi.post("/login", { email, password });
  setInvestorAuthToken(data.token);
  return data.investor;
};

export const logout = async () => {
  try {
    await investorApi.post("/logout");
  } finally {
    setInvestorAuthToken(null);
  }
};

export const me = async () => {
  const { data } = await investorApi.get("/me");
  return data.data;
};

export const startPersonaInquiry = async () => {
  const { data } = await investorApi.post("/persona/start");
  return data.data;
};

export const recordPersonaInquiryCompletion = async ({ inquiryId, status }) => {
  const { data } = await investorApi.post("/persona/complete", {
    inquiryId,
    status,
  });
  return data.data;
};
