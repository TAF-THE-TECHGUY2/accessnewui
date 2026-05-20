import { useCallback, useEffect, useState } from "react";
import { Download, FileSignature, RefreshCw, Send, Trash2 } from "lucide-react";

import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";
import {
  downloadAgreementPdf,
  getInvestorAgreements,
  resendAgreement,
  sendInvestorAgreement,
  voidAgreement,
} from "../../services/adminService";
import { formatDateTime } from "../../utils/formatters";

function InvestorAgreements({ investorCode, investorName }) {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!investorCode) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getInvestorAgreements(investorCode);
      setAgreements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load agreements.");
    } finally {
      setLoading(false);
    }
  }, [investorCode]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await sendInvestorAgreement(investorCode);
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to send agreement."
      );
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (envelopeId) => {
    setPendingId(envelopeId);
    setError(null);
    try {
      await resendAgreement(envelopeId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to resend agreement.");
    } finally {
      setPendingId(null);
    }
  };

  const handleVoid = async (envelopeId) => {
    const reason = window.prompt(
      "Why are you voiding this envelope? (Visible to signers in their cancellation notice.)"
    );
    if (!reason || reason.trim().length < 3) return;

    setPendingId(envelopeId);
    setError(null);
    try {
      await voidAgreement(envelopeId, reason.trim());
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to void agreement.");
    } finally {
      setPendingId(null);
    }
  };

  const handleDownload = async (envelopeId) => {
    setPendingId(envelopeId);
    setError(null);
    try {
      await downloadAgreementPdf(
        envelopeId,
        `${investorCode}-subscription-agreement.pdf`
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to download PDF.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf6f4] text-teal-700">
            <FileSignature className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Subscription Agreement
            </h3>
            <p className="text-xs text-gray-500">
              DocuSign-managed signing flow for {investorName || investorCode}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {sending ? "Sending..." : "Send agreement"}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : agreements.length === 0 ? (
        <EmptyState
          title="No agreements sent yet"
          description="Click 'Send agreement' to dispatch a subscription agreement via DocuSign."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/5">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f6f3] text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Signed</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {agreements.map((a) => (
                <tr key={a.id} className="bg-white">
                  <td className="px-4 py-3 align-top text-gray-700">
                    {formatDateTime(a.sentAt) || "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-gray-700">
                    {formatDateTime(a.signedAt) || "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-700">
                    {formatDateTime(a.completedAt) || "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="inline-flex items-center gap-2">
                      {a.hasSignedDocument ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(a.id)}
                          disabled={pendingId === a.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-[#f5f4f1] disabled:opacity-50"
                          title="Download signed PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </button>
                      ) : null}

                      {["sent", "delivered"].includes(a.status) ? (
                        <button
                          type="button"
                          onClick={() => handleResend(a.id)}
                          disabled={pendingId === a.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-[#f5f4f1] disabled:opacity-50"
                          title="Resend signing email"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Resend
                        </button>
                      ) : null}

                      {!["completed", "voided", "declined"].includes(a.status) ? (
                        <button
                          type="button"
                          onClick={() => handleVoid(a.id)}
                          disabled={pendingId === a.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          title="Void envelope"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Void
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default InvestorAgreements;
