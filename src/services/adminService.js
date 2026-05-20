import api from "./api";

export const getDashboardSummary = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

export const getInvestors = async (filters = {}) => {
  const { data } = await api.get("/investors", { params: filters });
  return data.data;
};

export const getInvestorById = async (id) => {
  try {
    const { data } = await api.get(`/investors/${id}`);
    return data.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateInvestorStatuses = async (id, updates) => {
  const { data } = await api.patch(`/investors/${id}/statuses`, updates);
  return data.data;
};

const runProcessingAction = async (investorId, action, payload = {}) => {
  const { data } = await api.post(`/investors/${investorId}/processing/${action}`, payload);
  return data.data;
};

export const startPersonaVerification = async (investorId) =>
  runProcessingAction(investorId, "start-persona-verification");

export const recordPersonaCompletion = async (investorId, { inquiryId, status }) => {
  const { data } = await api.post(`/investors/${investorId}/persona/complete`, {
    inquiryId,
    status,
  });
  return data.data;
};

export const startVerifyInvestorReview = async (investorId) =>
  runProcessingAction(investorId, "start-verifyinvestor-review");

export const sendDocusignDocuments = async (investorId) =>
  runProcessingAction(investorId, "send-docusign-documents");

export const approveLegalReview = async (investorId) =>
  runProcessingAction(investorId, "approve-legal-review");

export const rejectLegalReview = async (investorId, payload = {}) =>
  runProcessingAction(investorId, "reject-legal-review", payload);

export const releaseFundingInstructions = async (investorId) =>
  runProcessingAction(investorId, "release-funding-instructions");

export const markFundsSent = async (investorId, payload = {}) =>
  runProcessingAction(investorId, "mark-funds-sent", payload);

export const confirmFundsReceived = async (investorId) =>
  runProcessingAction(investorId, "confirm-funds-received");

export const generatePartnerRedirect = async (investorId) =>
  runProcessingAction(investorId, "generate-partner-redirect");

export const markRedirectedToPartner = async (investorId) =>
  runProcessingAction(investorId, "mark-redirected-to-partner");

export const addPartnerReferenceId = async (investorId, referenceId) =>
  runProcessingAction(investorId, "add-partner-reference", { referenceId });

export const markPartnerMatchPending = async (investorId) =>
  runProcessingAction(investorId, "mark-partner-match-pending");

export const confirmPartnerMatch = async (investorId) =>
  runProcessingAction(investorId, "confirm-partner-match");

export const activateInvestment = async (investorId) =>
  runProcessingAction(investorId, "activate-investment");

export const getKycQueue = async (filters = {}) => {
  const { data } = await api.get("/kyc-verification", { params: filters });
  return data;
};

export const updateKycReview = async (investorId, payload) => {
  const { data } = await api.post(`/kyc-verification/${investorId}/review`, payload);
  return data.data;
};

export const getEmailLogs = async (filters = {}) => {
  const { data } = await api.get("/email-logs", { params: filters });
  return data;
};

export const getReportsData = async () => {
  const { data } = await api.get("/reports");
  return data;
};

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const saveSettings = async (settings) => {
  const { data } = await api.put("/settings", settings);
  return data;
};

export const getInvestorAgreements = async (investorCode) => {
  const { data } = await api.get(`/investors/${investorCode}/agreements`);
  return data;
};

export const sendInvestorAgreement = async (investorCode) => {
  const { data } = await api.post(`/investors/${investorCode}/agreements/send`);
  return data;
};

export const resendAgreement = async (envelopeId) => {
  const { data } = await api.post(`/agreements/${envelopeId}/resend`);
  return data;
};

export const voidAgreement = async (envelopeId, reason) => {
  const { data } = await api.post(`/agreements/${envelopeId}/void`, { reason });
  return data;
};

export const downloadAgreementPdf = async (envelopeId, filename) => {
  const response = await api.get(`/agreements/${envelopeId}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || `agreement-${envelopeId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
