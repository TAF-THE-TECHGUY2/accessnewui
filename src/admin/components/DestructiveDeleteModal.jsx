import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

/**
 * Reusable "type to confirm" delete modal.
 *
 * Props:
 *   open        — whether modal is visible
 *   onClose     — close callback
 *   onConfirm   — async fn(code) called when user confirms
 *   code        — the entity identifier (e.g. "inv-1019" or "apdif-1")
 *   title       — e.g. "Delete this investor?"
 *   subtitle    — short copy explaining what gets deleted
 *   impact      — optional object {label: count, ...} to display cascade preview
 */
function DestructiveDeleteModal({ open, onClose, onConfirm, code, title, subtitle, impact }) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const matches = typed.trim() === (code || "").trim();

  const handleConfirm = async () => {
    if (!matches) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm(code);
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="mt-16 w-full max-w-md rounded-[22px] border-2 border-red-300 bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.25)]">
        <div className="flex items-start gap-3">
          <div className="rounded-[12px] bg-red-50 p-2.5 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-[20px] text-ink">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>

        {impact ? (
          <div className="mt-4 rounded-[12px] bg-red-50 px-4 py-3 text-xs text-red-800">
            <p className="font-semibold">This will permanently delete:</p>
            <ul className="mt-2 space-y-0.5">
              {Object.entries(impact).map(([label, count]) =>
                count > 0 ? (
                  <li key={label}>
                    <span className="font-mono">{count}</span>{" "}
                    {label.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </li>
                ) : null
              )}
              <li>The {code} record itself</li>
            </ul>
          </div>
        ) : null}

        <label className="mt-5 block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            Type{" "}
            <code className="font-mono text-ink">{code}</code> to confirm
          </span>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={busy}
            placeholder={code}
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 font-mono text-sm outline-none focus:border-red-600"
          />
        </label>

        {error ? (
          <div className="mt-3 rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

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
            onClick={handleConfirm}
            disabled={!matches || busy}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-red-700 px-4 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {busy ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestructiveDeleteModal;
