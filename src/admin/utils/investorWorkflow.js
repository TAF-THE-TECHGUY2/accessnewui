export const KYC_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const ACCREDITATION_STATUS_OPTIONS = [
  { value: "accredited", label: "Accredited" },
  { value: "non_accredited", label: "Non accredited" },
];

export const ACCREDITATION_VERIFICATION_STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "verification_required", label: "Verification required" },
  { value: "verification_submitted", label: "Verification submitted" },
  { value: "verification_approved", label: "Verification approved" },
  { value: "verification_rejected", label: "Verification rejected" },
];

export const DOCUMENT_SIGNING_STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "signed", label: "Signed" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
  { value: "completed", label: "Completed" },
];

export const INVESTMENT_STATUS_OPTIONS = [
  { value: "awaiting_kyc", label: "Awaiting KYC" },
  {
    value: "awaiting_accreditation_verification",
    label: "Awaiting accreditation verification",
  },
  { value: "awaiting_documents", label: "Awaiting documents" },
  { value: "awaiting_legal_approval", label: "Awaiting legal approval" },
  { value: "awaiting_funding", label: "Awaiting funding" },
  { value: "funds_sent", label: "Funds sent" },
  { value: "funds_confirmed", label: "Funds confirmed" },
  { value: "pending_partner_review", label: "Pending partner review" },
  { value: "redirected_to_partner", label: "Redirected to partner" },
  { value: "partner_match_pending", label: "Partner match pending" },
  { value: "partner_match_complete", label: "Partner match complete" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const DASHBOARD_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const getApprovedInvestmentStatus = (accreditationStatus) =>
  accreditationStatus === "accredited"
    ? "awaiting_accreditation_verification"
    : "pending_partner_review";

export const getInvestorPathwayLabel = (accreditationStatus) =>
  accreditationStatus === "accredited" ? "Accredited" : "Non-accredited";
