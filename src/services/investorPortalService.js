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
  const investor = data.data;
  // Surface top-level resource extras (added via JsonResource::additional)
  // alongside the investor record so callers can read platform-wide flags.
  if (data.platform) {
    investor.platform = data.platform;
  }
  return investor;
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

export const startInvestReadyVerification = async () => {
  const { data } = await investorApi.post("/investready/start");
  return data;
};

export const completeInvestReadyVerification = async ({ code, state }) => {
  const { data } = await investorApi.post("/investready/exchange", {
    code,
    state,
  });
  return data.data;
};

export const fetchFundingPaymentIntent = async () => {
  const { data } = await investorApi.post("/funding/payment-intent");
  return data;
};

export const fetchFundingStatus = async () => {
  const { data } = await investorApi.get("/funding/status");
  return data;
};

export const fetchPortalProfile = async () => {
  const { data } = await investorApi.get("/portal/profile");
  return data;
};

export const updatePortalProfile = async (payload) => {
  const { data } = await investorApi.patch("/portal/profile", payload);
  return data;
};

export const fetchPortfolio = async () => {
  const { data } = await investorApi.get("/portal/portfolio");
  return data;
};

export const fetchHoldings = async () => {
  const { data } = await investorApi.get("/portal/holdings");
  return data.data;
};

export const fetchHoldingPerformance = async (fundCode, range = "1Y") => {
  const { data } = await investorApi.get(
    `/portal/holdings/${fundCode}/performance`,
    { params: { range } }
  );
  return data;
};

export const fetchHoldingPriceHistory = async (fundCode) => {
  const { data } = await investorApi.get(
    `/portal/holdings/${fundCode}/price-history`
  );
  return data.data;
};

export const fetchHoldingDistributions = async (fundCode) => {
  const { data } = await investorApi.get(
    `/portal/holdings/${fundCode}/distributions`
  );
  return data;
};

export const fetchHoldingFees = async (fundCode) => {
  const { data } = await investorApi.get(`/portal/holdings/${fundCode}/fees`);
  return data;
};

export const fetchPortalDocuments = async () => {
  const { data } = await investorApi.get("/portal/documents");
  return data.data;
};

export const fetchCommunications = async () => {
  const { data } = await investorApi.get("/portal/communications");
  return data.data;
};

export const fetchCommunication = async (id) => {
  const { data } = await investorApi.get(`/portal/communications/${id}`);
  return data;
};

export const portalDocumentDownloadUrl = (id) => {
  const base =
    import.meta.env.VITE_LARAVEL_INVESTOR_API_URL ||
    "http://localhost:8000/api/investor";
  return `${base}/portal/documents/${id}/download`;
};
