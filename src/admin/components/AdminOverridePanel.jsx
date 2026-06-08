import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  FileSignature,
  Loader2,
  ShieldCheck,
  Unlock,
  Wallet,
  Zap,
} from "lucide-react";

import {
  overrideApproveAccreditation,
  overrideApproveKyc,
  overrideFullyActivate,
  overrideMarkDocumentsSigned,
  overrideMarkFunded,
} from "../../services/adminService";

const ACTIONS = [
  {
    key: "approve-kyc",
    label: "Approve KYC manually",
    description: "Bypass Persona. Set kycStatus=approved.",
    icon: BadgeCheck,
    requireAmount: false,
    danger: false,
  },
  {
    key: "approve-accreditation",
    label: "Approve accreditation manually",
    description: "Bypass InvestReady. Set accreditationVerificationStatus=verification_approved.",
    icon: ShieldCheck,
    requireAmount: false,
    danger: false,
  },
  {
    key: "mark-documents-signed",
    label: "Mark documents signed",
    description: "Bypass DocuSign. Set documentSigningStatus=completed.",
    icon: FileSignature,
    requireAmount: false,
    danger: false,
  },
  {
    key: "mark-funded",
    label: "Mark funded (Stripe bypass)",
    description: "Record funds received without ACH. Creates a FundHolding.",
    icon: Wallet,
    requireAmount: true,
    danger: false,
  },
  {
    key: "fully-activate",
    label: "Fully activate (one-click)",
    description: "Set KYC + accreditation + documents + funding + active. All at once.",
    icon: Zap,
    requireAmount: true,
    danger: true,
  },
];

function ActionModal({ action, investor, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(investor?.investmentInfo?.commitment || 25000);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!action) return null;

  const reasonValid = reason.trim().length >= 10;
  const amountValid = !action.requireAmount || Number(amount) > 0;
  const ready = reasonValid && amountValid;

  // Mega-button (fully-activate) requires an explicit second confirmation.
  const needsConfirmation = action.danger && !confirming;

  const handleSubmit = async () => {
    if (needsConfirmation) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let updated;
      switch (action.key) {
        case "approve-kyc":
          updated = await overrideApproveKyc(investor.id, reason);
          break;
        case "approve-accreditation":
          updated = await overrideApproveAccreditation(investor.id, reason);
          break;
        case "mark-documents-signed":
          updated = await overrideMarkDocumentsSigned(investor.id, reason);
          break;
        case "mark-funded":
          updated = await overrideMarkFunded(investor.id, Number(amount), reason);
          break;
        case "fully-activate":
          updated = await overrideFullyActivate(investor.id, Number(amount), reason);
          break;
        default:
          throw new Error("Unknown action");
      }
      onSuccess(updated);
      onClose();
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(fieldError || err?.response?.data?.message || "Could not apply override.");
    } finally {
      setBusy(false);
    }
  };

  const Icon = action.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="mt-16 w-full max-w-md rounded-[22px] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.2)]">
        <div className="flex items-start gap-3">
          <div className={`rounded-[12px] p-2.5 ${action.danger ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-[20px] text-ink">{action.label}</h3>
            <p className="mt-1 text-sm text-gray-500">{action.description}</p>
          </div>
        </div>

        {needsConfirmation ? (
          <div className="mt-5 rounded-[12px] bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Are you sure?</p>
            <p className="mt-1">
              This will flip {investor?.name} ({investor?.id}) all the way to{" "}
              <strong>active</strong>, create a FundHolding, and bypass every
              verification. The audit log will record you as the override author.
            </p>
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {action.requireAmount ? (
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                Amount ($)
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={busy}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
              />
            </label>
          ) : null}
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Reason (required, 10+ chars)
            </span>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
              placeholder="e.g. Verified passport in person at Boston office, 2026-06-08"
              className="mt-1.5 w-full rounded-[10px] border border-black/10 p-3 text-sm outline-none focus:border-teal-600"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              {reason.length}/10 chars minimum. Logged with investor activity for audit.
            </p>
          </label>

          {error ? (
            <div className="rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 rounded-[10px] border border-black/10 px-4 text-sm font-medium text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!ready || busy}
            className={`inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-sm font-medium text-white disabled:opacity-50 ${
              action.danger ? "bg-red-700 hover:bg-red-800" : "bg-black hover:bg-[#1f2937]"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {needsConfirmation ? "Yes — apply override" : (busy ? "Applying…" : "Apply override")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminOverridePanel({ investor, onInvestorUpdated }) {
  const [openAction, setOpenAction] = useState(null);

  return (
    <section className="rounded-[22px] border-2 border-amber-300 bg-amber-50/40 p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-[12px] bg-amber-100 p-2.5 text-amber-800">
          <Unlock className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-ink">Manual overrides</h3>
          <p className="mt-0.5 text-sm text-gray-600">
            Bypass an integration and mark a step done. Every action requires a
            written reason and is recorded in the investor's activity log and
            integration requests.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-900">
          <AlertTriangle className="h-3 w-3" /> use with care
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => setOpenAction(action)}
              className={`flex items-start gap-3 rounded-[14px] border bg-white p-4 text-left transition hover:border-black/30 ${
                action.danger ? "border-red-300" : "border-black/10"
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${action.danger ? "text-red-700" : "text-amber-700"}`} />
              <div>
                <p className="text-sm font-medium text-ink">{action.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <ActionModal
        action={openAction}
        investor={investor}
        onClose={() => setOpenAction(null)}
        onSuccess={(updated) => onInvestorUpdated?.(updated)}
      />
    </section>
  );
}

export default AdminOverridePanel;
