import { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Hourglass,
  Loader2,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  UserSearch,
  XCircle,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import PersonaInquiryModal from "./PersonaInquiryModal";
import {
  activateInvestment,
  addPartnerReferenceId,
  approveLegalReview,
  confirmFundsReceived,
  confirmPartnerMatch,
  generatePartnerRedirect,
  markFundsSent,
  markPartnerMatchPending,
  markRedirectedToPartner,
  rejectLegalReview,
  releaseFundingInstructions,
  sendDocusignDocuments,
  startPersonaVerification,
  startVerifyInvestorReview,
} from "../../services/adminService";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const ACCREDITED_STEPS = [
  {
    key: "start-persona-verification",
    label: "Start Persona Verification",
    description: "Send identity verification request via Persona.",
    icon: UserSearch,
    allowedStatuses: ["awaiting_kyc", "awaiting_accreditation_verification"],
  },
  {
    key: "start-verifyinvestor-review",
    label: "Start VerifyInvestor Review",
    description: "Submit accreditation review to verifyinvestor.com.",
    icon: ShieldCheck,
    allowedStatuses: ["awaiting_accreditation_verification"],
  },
  {
    key: "send-docusign-documents",
    label: "Send DocuSign Documents",
    description: "Send subscription documents for signature.",
    icon: FileSignature,
    allowedStatuses: [
      "awaiting_accreditation_verification",
      "awaiting_documents",
    ],
  },
  {
    key: "approve-legal-review",
    label: "Approve Legal Review",
    description: "Admin/legal approves the package for funding.",
    icon: BadgeCheck,
    variant: "approve",
    allowedStatuses: [
      "awaiting_accreditation_verification",
      "awaiting_documents",
    ],
  },
  {
    key: "reject-legal-review",
    label: "Reject Legal Review",
    description: "Send back to investor for re-submission.",
    icon: XCircle,
    variant: "reject",
    requiresReason: true,
    allowedStatuses: [
      "awaiting_accreditation_verification",
      "awaiting_documents",
    ],
  },
  {
    key: "release-funding-instructions",
    label: "Release Funding Instructions",
    description: "Email funding instructions to the investor.",
    icon: PiggyBank,
    allowedStatuses: ["awaiting_funding"],
  },
  {
    key: "mark-funds-sent",
    label: "Mark Funds Sent",
    description: "Investor reported funds were sent or uploaded proof.",
    icon: Banknote,
    requiresPaymentForm: true,
    allowedStatuses: ["awaiting_funding"],
  },
  {
    key: "confirm-funds-received",
    label: "Confirm Funds Received",
    description: "Admin confirms funds landed in escrow.",
    icon: CheckCircle2,
    variant: "approve",
    allowedStatuses: ["funds_sent"],
  },
  {
    key: "activate-investment",
    label: "Activate Investment",
    description: "Activate dashboard and send activation email.",
    icon: Sparkles,
    variant: "primary",
    allowedStatuses: ["funds_confirmed"],
  },
];

const NON_ACCREDITED_STEPS = [
  {
    key: "generate-partner-redirect",
    label: "Generate Partner Redirect",
    description: "Create a crowdfunding partner / WeFunder redirect URL.",
    icon: ExternalLink,
    allowedStatuses: ["pending_partner_review"],
  },
  {
    key: "mark-redirected-to-partner",
    label: "Mark As Redirected",
    description: "Confirm the investor was redirected to the partner site.",
    icon: ExternalLink,
    allowedStatuses: ["pending_partner_review"],
  },
  {
    key: "add-partner-reference",
    label: "Add Partner Reference ID",
    description: "Record partner reference for manual matching (3–7 months).",
    icon: UserSearch,
    requiresReference: true,
    allowedStatuses: ["redirected_to_partner", "partner_match_pending"],
  },
  {
    key: "mark-partner-match-pending",
    label: "Mark Match Pending Review",
    description: "Loop while waiting on partner review.",
    icon: Hourglass,
    allowedStatuses: ["redirected_to_partner", "partner_match_pending"],
  },
  {
    key: "confirm-partner-match",
    label: "Confirm Partner Match",
    description: "Manual matching is complete.",
    icon: BadgeCheck,
    variant: "approve",
    allowedStatuses: ["partner_match_pending"],
  },
  {
    key: "activate-investment",
    label: "Activate Investment",
    description: "Activate dashboard and send activation email.",
    icon: Sparkles,
    variant: "primary",
    allowedStatuses: ["partner_match_complete"],
  },
];

const VARIANT_CLASSES = {
  primary:
    "bg-[#0f4f4f] text-white hover:bg-[#0b3f3f] disabled:bg-[#cdd6d6] disabled:text-white/80",
  approve:
    "bg-[#edf6f4] text-teal-800 hover:bg-[#dcefeb] disabled:bg-[#f4f1ed] disabled:text-slate-400",
  reject:
    "bg-[#fff1ef] text-red-700 hover:bg-[#ffe1dc] disabled:bg-[#f5ece8] disabled:text-slate-400",
  default:
    "bg-white text-teal-800 ring-1 ring-inset ring-[#d8e7e4] hover:bg-[#f4faf8] disabled:bg-[#f6f4ef] disabled:text-slate-400 disabled:ring-[#ece8e2]",
};

function actionRunner(action, investorId, extras) {
  switch (action) {
    case "start-persona-verification":
      return startPersonaVerification(investorId);
    case "start-verifyinvestor-review":
      return startVerifyInvestorReview(investorId);
    case "send-docusign-documents":
      return sendDocusignDocuments(investorId);
    case "approve-legal-review":
      return approveLegalReview(investorId);
    case "reject-legal-review":
      return rejectLegalReview(investorId, { reason: extras.reason });
    case "release-funding-instructions":
      return releaseFundingInstructions(investorId);
    case "mark-funds-sent":
      return markFundsSent(investorId, extras.payment);
    case "confirm-funds-received":
      return confirmFundsReceived(investorId);
    case "generate-partner-redirect":
      return generatePartnerRedirect(investorId);
    case "mark-redirected-to-partner":
      return markRedirectedToPartner(investorId);
    case "add-partner-reference":
      return addPartnerReferenceId(investorId, extras.referenceId);
    case "mark-partner-match-pending":
      return markPartnerMatchPending(investorId);
    case "confirm-partner-match":
      return confirmPartnerMatch(investorId);
    case "activate-investment":
      return activateInvestment(investorId);
    default:
      throw new Error(`Unknown processing action: ${action}`);
  }
}

function RecordTable({ icon: Icon, title, records, columns, emptyHint }) {
  return (
    <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf6f4] text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
      </div>

      {records.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                {columns.map((col) => (
                  <th key={col.key} className="pb-2 pr-4 font-semibold">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1ebe3]">
              {records.map((record) => (
                <tr key={record.id} className="text-slate-700">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 pr-4 align-top">
                      {col.render
                        ? col.render(record)
                        : record[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyHint}</p>
      )}
    </section>
  );
}

function InvestorProcessingPanel({ investor, onInvestorUpdated }) {
  const [submittingAction, setSubmittingAction] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [partnerReferenceId, setPartnerReferenceId] = useState("");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: investor.investmentInfo.commitment ?? "",
    reference: "",
    notes: "",
    proofFileUrl: "",
  });

  const isAccredited = investor.accreditationStatus === "accredited";
  const steps = isAccredited ? ACCREDITED_STEPS : NON_ACCREDITED_STEPS;
  const currentStatus = investor.investmentStatus;
  const processing = investor.processing ?? {};

  const fundingInstructions = processing.fundingInstructions ?? [];
  const paymentConfirmations = processing.paymentConfirmations ?? [];
  const partnerMatches = processing.partnerMatches ?? [];
  const integrationRequests = processing.integrationRequests ?? [];
  const activityLogs = processing.activityLogs ?? [];

  const isAtEnd = currentStatus === "active";

  const stepStates = useMemo(() => {
    return steps.map((step) => ({
      ...step,
      enabled: step.allowedStatuses.includes(currentStatus) && !isAtEnd,
    }));
  }, [steps, currentStatus, isAtEnd]);

  const handleRun = async (step) => {
    setActionError(null);

    if (step.requiresReason && !rejectionReason.trim()) {
      setActiveForm(step.key);
      setActionError("Add a rejection reason before continuing.");
      return;
    }
    if (step.requiresReference && !partnerReferenceId.trim()) {
      setActiveForm(step.key);
      setActionError("Add a partner reference ID before continuing.");
      return;
    }

    setSubmittingAction(step.key);
    try {
      const updated = await actionRunner(step.key, investor.id, {
        reason: rejectionReason.trim() || undefined,
        referenceId: partnerReferenceId.trim() || undefined,
        payment: step.requiresPaymentForm
          ? {
              amount: paymentForm.amount
                ? Number(paymentForm.amount)
                : undefined,
              reference: paymentForm.reference || undefined,
              notes: paymentForm.notes || undefined,
              proofFileUrl: paymentForm.proofFileUrl || undefined,
            }
          : undefined,
      });
      onInvestorUpdated(updated);
      setActiveForm(null);
      if (step.requiresReason) setRejectionReason("");
      if (step.requiresReference) setPartnerReferenceId("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Processing action failed. Try again.";
      setActionError(message);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {isAccredited ? "Phase 3A · Accredited" : "Phase 3B · Non-accredited"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {isAccredited
                ? "Direct subscription pathway"
                : "Crowdfunding partner pathway"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {isAccredited
                ? "Persona + verifyinvestor.com + DocuSign, then admin/legal approval, funding instructions, and activation."
                : "Redirect to crowdfunding partner / WeFunder, then manual matching by reference ID before activation."}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={investor.accreditationStatus} />
              <StatusBadge status={currentStatus} />
              <StatusBadge status={investor.dashboardStatus} />
            </div>

            {isAccredited ? (
              <button
                type="button"
                onClick={() => setShowPersonaModal(true)}
                className="inline-flex items-center gap-2 rounded-[14px] bg-white px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-inset ring-[#d8e7e4] transition hover:bg-[#f4faf8]"
              >
                <UserSearch className="h-4 w-4" />
                Launch Persona widget
              </button>
            ) : null}
          </div>
        </div>

        {actionError ? (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] bg-[#fff1ef] p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        ) : null}

        {isAtEnd ? (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] bg-[#edf6f4] p-4 text-sm text-teal-800">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Investment is active. Activation email and communication have been
              recorded.
            </p>
          </div>
        ) : null}

        <ol className="mt-6 space-y-4">
          {stepStates.map((step, index) => {
            const Icon = step.icon;
            const variantClass =
              VARIANT_CLASSES[step.variant ?? "default"] ||
              VARIANT_CLASSES.default;
            const isSubmitting = submittingAction === step.key;
            const isFormOpen = activeForm === step.key;

            return (
              <li
                key={step.key}
                className={`rounded-[20px] border p-5 transition ${
                  step.enabled
                    ? "border-[#d8e7e4] bg-white"
                    : "border-[#eee5d8] bg-[#fbf8f2] opacity-80"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        step.enabled
                          ? "bg-[#edf6f4] text-teal-700"
                          : "bg-[#f1ebe3] text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-base font-semibold text-ink">
                        {step.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!step.enabled || Boolean(submittingAction)}
                    onClick={() => {
                      if (
                        step.requiresReason ||
                        step.requiresReference ||
                        step.requiresPaymentForm
                      ) {
                        if (isFormOpen) {
                          handleRun(step);
                        } else {
                          setActiveForm(step.key);
                          setActionError(null);
                        }
                      } else {
                        handleRun(step);
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variantClass}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {isFormOpen &&
                    (step.requiresReason ||
                      step.requiresReference ||
                      step.requiresPaymentForm)
                      ? "Submit"
                      : step.label}
                  </button>
                </div>

                {isFormOpen && step.requiresReason ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Rejection reason
                    </label>
                    <textarea
                      className="h-24 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] p-3 text-sm text-ink outline-none transition focus:border-teal-600"
                      value={rejectionReason}
                      onChange={(event) =>
                        setRejectionReason(event.target.value)
                      }
                      placeholder="Why is the package being rejected?"
                    />
                  </div>
                ) : null}

                {isFormOpen && step.requiresReference ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Partner reference ID
                    </label>
                    <input
                      type="text"
                      className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                      value={partnerReferenceId}
                      onChange={(event) =>
                        setPartnerReferenceId(event.target.value)
                      }
                      placeholder="e.g. WF-2026-0192"
                    />
                  </div>
                ) : null}

                {isFormOpen && step.requiresPaymentForm ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                        value={paymentForm.amount}
                        onChange={(event) =>
                          setPaymentForm((form) => ({
                            ...form,
                            amount: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Reference
                      </label>
                      <input
                        type="text"
                        className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                        value={paymentForm.reference}
                        onChange={(event) =>
                          setPaymentForm((form) => ({
                            ...form,
                            reference: event.target.value,
                          }))
                        }
                        placeholder="Wire / transfer reference"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Proof file URL
                      </label>
                      <input
                        type="text"
                        className="h-11 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] px-4 text-sm text-ink outline-none transition focus:border-teal-600"
                        value={paymentForm.proofFileUrl}
                        onChange={(event) =>
                          setPaymentForm((form) => ({
                            ...form,
                            proofFileUrl: event.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Notes
                      </label>
                      <textarea
                        className="h-20 w-full rounded-[16px] border border-[#eadfd2] bg-[#fcfaf7] p-3 text-sm text-ink outline-none transition focus:border-teal-600"
                        value={paymentForm.notes}
                        onChange={(event) =>
                          setPaymentForm((form) => ({
                            ...form,
                            notes: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecordTable
          icon={PiggyBank}
          title="Funding Instructions"
          records={fundingInstructions}
          emptyHint="No funding instructions released yet."
          columns={[
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "deliveryChannel",
              label: "Channel",
              render: (r) => r.deliveryChannel || "—",
            },
            {
              key: "releasedAt",
              label: "Released",
              render: (r) => (r.releasedAt ? formatDateTime(r.releasedAt) : "—"),
            },
            {
              key: "externalUrl",
              label: "Link",
              render: (r) =>
                r.externalUrl ? (
                  <a
                    href={r.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  "—"
                ),
            },
          ]}
        />

        <RecordTable
          icon={Banknote}
          title="Payment Confirmations"
          records={paymentConfirmations}
          emptyHint="No payment confirmations recorded."
          columns={[
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "amount",
              label: "Amount",
              render: (r) => formatCurrency(r.amount),
            },
            {
              key: "reference",
              label: "Reference",
              render: (r) => r.reference || "—",
            },
            {
              key: "confirmedAt",
              label: "Confirmed",
              render: (r) =>
                r.confirmedAt ? formatDateTime(r.confirmedAt) : "—",
            },
          ]}
        />

        <RecordTable
          icon={UserSearch}
          title="Partner Matches"
          records={partnerMatches}
          emptyHint="No partner matching records yet."
          columns={[
            {
              key: "partnerName",
              label: "Partner",
              render: (r) => r.partnerName || "—",
            },
            {
              key: "partnerReferenceId",
              label: "Reference",
              render: (r) => r.partnerReferenceId || "—",
            },
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "matchedAt",
              label: "Matched",
              render: (r) => (r.matchedAt ? formatDateTime(r.matchedAt) : "—"),
            },
          ]}
        />

        <RecordTable
          icon={ShieldCheck}
          title="Integration Requests"
          records={integrationRequests}
          emptyHint="No external integration calls recorded."
          columns={[
            {
              key: "provider",
              label: "Provider",
              render: (r) => r.provider,
            },
            { key: "type", label: "Type", render: (r) => r.type },
            {
              key: "status",
              label: "Status",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "createdAt",
              label: "Created",
              render: (r) => (r.createdAt ? formatDateTime(r.createdAt) : "—"),
            },
          ]}
        />
      </div>

      <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf6f4] text-teal-700">
            <Hourglass className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-ink">Processing Timeline</h3>
        </div>

        {activityLogs.length ? (
          <ol className="space-y-4">
            {activityLogs.map((log) => (
              <li key={log.id} className="relative pl-6">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">{log.title}</p>
                  <p className="text-xs text-slate-400">
                    {log.occurredAt ? formatDateTime(log.occurredAt) : "—"}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{log.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">
            No processing activity recorded yet.
          </p>
        )}
      </section>

      {showPersonaModal ? (
        <PersonaInquiryModal
          investor={investor}
          onClose={() => setShowPersonaModal(false)}
          onInvestorUpdated={onInvestorUpdated}
        />
      ) : null}
    </div>
  );
}

export default InvestorProcessingPanel;
