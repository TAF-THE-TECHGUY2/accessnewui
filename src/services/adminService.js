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

export const getInvestReadyStatus = async (investorCode) => {
  const { data } = await api.get(`/investors/${investorCode}/investready`);
  return data;
};

export const resyncInvestReady = async (investorCode) => {
  const { data } = await api.post(`/investors/${investorCode}/investready/resync`);
  return data;
};

// Fund management (Phase 5A)
export const fetchAdminFunds = async () => {
  const { data } = await api.get("/funds");
  return data.data;
};

export const fetchAdminFund = async (code) => {
  const { data } = await api.get(`/funds/${code}`);
  return data;
};

export const createAdminFund = async (payload) => {
  const { data } = await api.post("/funds", payload);
  return data;
};

export const updateAdminFund = async (code, payload) => {
  const { data } = await api.patch(`/funds/${code}`, payload);
  return data;
};

export const deleteAdminFund = async (code, confirm) => {
  const { data } = await api.delete(`/funds/${code}`, { data: { confirm } });
  return data;
};

export const deleteInvestor = async (code, confirm) => {
  const { data } = await api.delete(`/investors/${code}`, { data: { confirm } });
  return data;
};

export const createAdminInvestor = async (payload) => {
  const { data } = await api.post("/investors", payload);
  return data.data;
};

export const addFundUnitPrice = async (code, payload) => {
  const { data } = await api.post(`/funds/${code}/unit-prices`, payload);
  return data;
};

export const deleteFundUnitPrice = async (id) => {
  const { data } = await api.delete(`/unit-prices/${id}`);
  return data;
};

export const declareFundDistribution = async (code, payload) => {
  const { data } = await api.post(`/funds/${code}/distributions`, payload);
  return data;
};

export const deleteFundDistribution = async (id) => {
  const { data } = await api.delete(`/distributions/${id}`);
  return data;
};

export const declareFundFee = async (code, payload) => {
  const { data } = await api.post(`/funds/${code}/fees`, payload);
  return data;
};

export const deleteFundFee = async (id) => {
  const { data } = await api.delete(`/fees/${id}`);
  return data;
};

export const uploadFundDocument = async (code, payload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("category", payload.category);
  formData.append("file", payload.file);
  if (payload.subcategory) formData.append("subcategory", payload.subcategory);
  if (payload.documentDatedAt) formData.append("documentDatedAt", payload.documentDatedAt);

  const { data } = await api.post(`/funds/${code}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const downloadFundDocument = async (code, document) => {
  const response = await api.get(`/funds/${code}/documents/${document.id}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.title?.toLowerCase().endsWith(".pdf")
    ? document.title
    : `${document.title || "offering-document"}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteFundDocument = async (code, id) => {
  const { data } = await api.delete(`/funds/${code}/documents/${id}`);
  return data;
};

// Communications (Phase 4 admin)
export const fetchAdminCommunications = async () => {
  const { data } = await api.get("/communications");
  return data.data;
};

export const createAdminCommunication = async (payload) => {
  const { data } = await api.post("/communications", payload);
  return data;
};

export const updateAdminCommunication = async (id, payload) => {
  const { data } = await api.patch(`/communications/${id}`, payload);
  return data;
};

export const deleteAdminCommunication = async (id) => {
  const { data } = await api.delete(`/communications/${id}`);
  return data;
};

// Manual override actions — bypass integrations + force statuses
const runOverrideAction = async (investorCode, action, payload) => {
  const { data } = await api.post(`/investors/${investorCode}/override/${action}`, payload);
  return data.data;
};

export const overrideApproveKyc = (investorCode, reason) =>
  runOverrideAction(investorCode, "approve-kyc", { reason });

export const overrideApproveAccreditation = (investorCode, reason) =>
  runOverrideAction(investorCode, "approve-accreditation", { reason });

export const overrideMarkDocumentsSigned = (investorCode, reason) =>
  runOverrideAction(investorCode, "mark-documents-signed", { reason });

export const overrideMarkFunded = (investorCode, amount, reason) =>
  runOverrideAction(investorCode, "mark-funded", { reason, amount });

export const overrideFullyActivate = (investorCode, amount, reason) =>
  runOverrideAction(investorCode, "fully-activate", { reason, amount });

// Admin-editable transactional email templates
export const getEmailTemplates = async () => {
  const { data } = await api.get("/email-templates");
  return data.data;
};

export const getEmailTemplate = async (key) => {
  const { data } = await api.get(`/email-templates/${key}`);
  return data;
};

export const updateEmailTemplate = async (key, payload) => {
  const { data } = await api.put(`/email-templates/${key}`, payload);
  return data;
};

export const previewEmailTemplate = async (key, payload) => {
  const { data } = await api.post(`/email-templates/${key}/preview`, payload);
  return data;
};

export const sendEmailTemplateTest = async (key, email) => {
  const { data } = await api.post(`/email-templates/${key}/test`, { email });
  return data;
};

export const resetEmailTemplate = async (key) => {
  const { data } = await api.post(`/email-templates/${key}/reset`);
  return data;
};
