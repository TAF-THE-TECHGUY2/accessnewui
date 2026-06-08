import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import StatusBadge from "./StatusBadge";
import {
  getInvestReadyStatus,
  resyncInvestReady,
} from "../../services/adminService";
import { formatDateTime } from "../../utils/formatters";

function StatRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p
        className={`text-sm text-ink ${mono ? "font-mono break-all" : ""}`}
        title={typeof value === "string" ? value : undefined}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function InvestReadyPanel({ investorCode, onInvestorUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const summary = await getInvestReadyStatus(investorCode);
      setData(summary);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not load InvestReady status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorCode]);

  const handleResync = async () => {
    setResyncing(true);
    setError(null);
    try {
      const response = await resyncInvestReady(investorCode);
      setData(response.investready);
      if (response.investor && onInvestorUpdated) {
        onInvestorUpdated(response.investor);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Re-sync failed. Check the integration history below."
      );
      await load();
    } finally {
      setResyncing(false);
    }
  };

  return (
    <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-[12px] bg-[#eef5f4] p-2.5 text-teal-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">InvestReady</h3>
            <p className="text-sm text-gray-500">
              Accreditation verification via developer.investready.com
            </p>
          </div>
        </div>

        {data?.linked ? (
          <button
            type="button"
            onClick={handleResync}
            disabled={resyncing}
            className="flex items-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 py-2 text-xs font-medium text-ink shadow-soft transition hover:border-black/30 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resyncing ? "animate-spin" : ""}`} />
            {resyncing ? "Re-syncing..." : "Re-sync"}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading...</p>
      ) : !data?.linked ? (
        <div className="mt-6 flex items-start gap-3 rounded-[14px] bg-gray-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 text-gray-500" />
          <div className="text-sm text-gray-600">
            This investor has not linked an InvestReady account yet. They will
            see a "Verify accredited status" card on their dashboard when their
            KYC is approved.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatRow label="Mapped status" value={
              <StatusBadge status={data.mappedStatus} />
            } />
            <StatRow
              label="Last synced"
              value={data.lastSyncAt ? formatDateTime(data.lastSyncAt) : "—"}
            />
            <StatRow label="InvestReady email" value={data.personEmail} />
            <StatRow
              label="Person hash"
              value={data.personHash}
              mono
            />
            <StatRow
              label="Token expires"
              value={data.tokenExpiresAt ? formatDateTime(data.tokenExpiresAt) : "—"}
            />
            <StatRow
              label="Token status"
              value={
                data.tokenExpired === null
                  ? "—"
                  : data.tokenExpired
                  ? "Expired (will refresh on next sync)"
                  : "Valid"
              }
            />
          </div>

          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Certificates ({data.certificatesCount})
            </p>
            {data.certificatesCount === 0 ? (
              <p className="mt-2 text-sm text-gray-600">
                Account linked but no certificates yet — investor has not
                completed an accreditation verification on InvestReady.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.certificates.map((c, idx) => (
                  <li
                    key={c.id ?? idx}
                    className="flex items-center justify-between rounded-[12px] border border-black/5 bg-[#fafaf8] px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-teal-700" />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {c.type ?? "Certificate"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.expiresAt ? `Expires ${formatDateTime(c.expiresAt)}` : "—"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={c.status ?? "pending"} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {data?.history?.length ? (
        <div className="mt-6 border-t border-black/5 pt-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            Recent integration requests
          </p>
          <ul className="mt-3 space-y-2">
            {data.history.map((h) => (
              <li
                key={h.id}
                className="flex items-start justify-between gap-3 rounded-[12px] border border-black/5 px-4 py-2.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500">#{h.id}</span>
                    <StatusBadge status={h.status} />
                    <span className="text-gray-500">
                      {formatDateTime(h.createdAt)}
                    </span>
                  </div>
                  {h.errorMessage ? (
                    <p className="mt-1 text-red-700 break-words">
                      {h.failureStage ? `[${h.failureStage}] ` : ""}
                      {h.failureHttpStatus ? `HTTP ${h.failureHttpStatus} ` : ""}
                      {h.errorMessage}
                    </p>
                  ) : null}
                  {h.failureUrl ? (
                    <p className="mt-0.5 font-mono text-gray-400 break-all">
                      <ExternalLink className="mr-1 inline h-3 w-3" />
                      {h.failureUrl}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default InvestReadyPanel;
