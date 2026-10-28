import investorApi, { setInvestorAuthToken } from "./investorApi";
import { deviceTokenStore, makeTwoFactorApi } from "./twoFactorService";

const device = deviceTokenStore("access_investor_device");

export const investorTwoFactor = makeTwoFactorApi(investorApi);

const finishSignIn = (data) => {
  setInvestorAuthToken(data.token);
  device.write(data.deviceToken);
  return { ...data.investor, twoFactorSetupRequired: Boolean(data.twoFactorSetupRequired) };
};

/**
 * Either signs in and returns the investor, or — when they have two-factor on
 * and this browser is not remembered — returns `{ twoFactorRequired,
 * challenge }` for the code step.
 */
export const login = async ({ email, password }) => {
  const { data } = await investorApi.post("/login", {
    email,
    password,
    deviceToken: device.read(),
  });

  if (data.twoFactorRequired) {
    return { twoFactorRequired: true, challenge: data.challenge };
  }

  return finishSignIn(data);
};

export const completeTwoFactorLogin = async ({ challenge, code, recoveryCode, remember }) => {
  const { data } = await investorApi.post("/login/two-factor", {
    challenge,
    code,
    recoveryCode,
    remember,
  });
  return finishSignIn(data);
};

export const logout = async () => {
  try {
    await investorApi.post("/logout");
  } finally {
    setInvestorAuthToken(null);
  }
};

/**
 * Re-issues the shared `.ap.boston` cookie that unlocks the gated fund pages on
 * the marketing site. Investors who signed in before that cookie existed, or
 * whose cookie has expired, would otherwise keep seeing the locked page here
 * despite being signed in. Failure is not worth surfacing -- it costs the
 * visitor nothing but a locked marketing page.
 */
export const refreshMemberSession = async () => {
  try {
    await investorApi.post("/session/refresh");
    return true;
  } catch {
    return false;
  }
};

export const requestPasswordReset = async ({ email }) => {
  const { data } = await investorApi.post("/password/forgot", { email });
  return data;
};

export const resetPassword = async ({
  email,
  token,
  password,
  passwordConfirmation,
}) => {
  const { data } = await investorApi.post("/password/reset", {
    email,
    token,
    password,
    password_confirmation: passwordConfirmation,
  });
  return data;
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

// Omit `amount` for the onboarding subscription — the server bills the original
// commitment. Pass one to open an additional subscription on an active position.
export const fetchFundingPaymentIntent = async (amount) => {
  const { data } = await investorApi.post(
    "/funding/payment-intent",
    amount != null ? { amount } : {},
  );
  return data;
};

// Only succeeds while demo mode is enabled in admin settings; the server
// returns 403 otherwise.
export const simulateFundingPayment = async (amount) => {
  const { data } = await investorApi.post(
    "/funding/simulate",
    amount != null ? { amount } : {},
  );
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

/**
 * The fund's real estate, proxied by our API from the site that manages it.
 *
 * Resolves to `{ data, unavailable }`. `unavailable` is set when the source
 * could not be read — the caller shows an explanation rather than an empty
 * list, so "the feed is down" never reads as "this fund owns nothing".
 */
export const fetchHoldingProperties = async (fundCode) => {
  const { data } = await investorApi.get(
    `/portal/holdings/${fundCode}/properties`
  );
  return { data: data.data ?? [], unavailable: data.unavailable ?? null };
};

export const fetchPortalDocuments = async () => {
  const { data } = await investorApi.get("/portal/documents");
  return data.data;
};

/**
 * The same request, with the investor's own signed agreements alongside. Kept
 * separate because callers that walk every category of fetchPortalDocuments()
 * would otherwise list the signed set as one more category.
 */
export const fetchPortalDocumentsWithSigned = async () => {
  const { data } = await investorApi.get("/portal/documents");
  return { grouped: data.data, signed: data.signed || [] };
};

export const downloadSignedAgreement = async (agreement) => {
  const response = await investorApi.get(
    `/portal/agreements/${agreement.id}/download`,
    { responseType: "blob" }
  );
  // Typed here rather than trusting the response: a blob URL runs on this
  // origin, so it must never open as anything but a PDF.
  const blobUrl = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = window.document.createElement("a");
  link.href = blobUrl;
  link.download = `${(agreement.title || "agreement").replace(/\s+/g, "-").toLowerCase()}-signed.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadPortalDocument = async (document) => {
  const response = await investorApi.get(
    `/portal/documents/${document.id}/download`,
    { responseType: "blob" }
  );
  const blobUrl = window.URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = blobUrl;
  link.download = document.title?.toLowerCase().endsWith(".pdf")
    ? document.title
    : `${document.title || "offering-document"}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

/**
 * Opens a document in a new tab instead of saving it.
 *
 * Uses the same authorised /download response — the endpoint streams the file
 * and the browser decides what to do with the blob, so previewing needs no
 * second route and no public URL. The object URL is revoked on a timer rather
 * than immediately: revoking it before the new tab has read it leaves a blank
 * viewer.
 */
export const openPortalDocument = async (document) => {
  const response = await investorApi.get(
    `/portal/documents/${document.id}/download`,
    { responseType: "blob" }
  );
  // Always a PDF, whatever the response says: the blob opens on this origin,
  // and an HTML or SVG file opened here could run script. Uploads are PDF-only
  // today; this keeps it so if that rule ever loosens.
  const blob = new Blob([response.data], { type: "application/pdf" });
  const blobUrl = window.URL.createObjectURL(blob);
  const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    window.URL.revokeObjectURL(blobUrl);
    throw new Error("Your browser blocked the preview window.");
  }

  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
};

export const fetchCommunications = async () => {
  const { data } = await investorApi.get("/portal/communications");
  return data.data;
};

export const fetchCommunication = async (id) => {
  const { data } = await investorApi.get(`/portal/communications/${id}`);
  return data;
};

/**
 * Per-investment breakdown and totals, computed to the fund manager's workbook
 * formulas. Returns { fund, rows, totals }.
 *
 * Throws on 422 when the fund has no published unit value — the position genuinely
 * cannot be valued, and the UI says so rather than showing a fabricated number.
 */
/** Secure message threads for the signed-in investor. */
export const fetchThreads = async () => {
  const { data } = await investorApi.get("/portal/threads");
  return data.data;
};

/**
 * One thread with its messages.
 *
 * Fetching also marks the team's messages read, so the unread count cannot
 * drift from what the investor has actually been shown.
 */
export const fetchThread = async (id) => {
  const { data } = await investorApi.get(`/portal/threads/${id}`);
  return data;
};

export const createThread = async ({ subject, body, category, portalDocumentId }) => {
  const { data } = await investorApi.post("/portal/threads", {
    subject,
    body,
    category,
    portalDocumentId,
  });
  return data;
};

export const replyToThread = async (id, { body, portalDocumentId }) => {
  const { data } = await investorApi.post(`/portal/threads/${id}/messages`, {
    body,
    portalDocumentId,
  });
  return data;
};

/** Password change for a signed-in investor. Requires the current password. */
export const changePortalPassword = async ({
  currentPassword,
  password,
  passwordConfirmation,
}) => {
  const { data } = await investorApi.post("/portal/password", {
    currentPassword,
    password,
    password_confirmation: passwordConfirmation,
  });
  return data;
};

export const fetchBreakdown = async (fundCode) => {
  const { data } = await investorApi.get(
    fundCode ? `/portal/breakdown/${fundCode}` : "/portal/breakdown",
  );
  return data;
};
