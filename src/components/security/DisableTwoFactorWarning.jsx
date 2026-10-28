import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * The risk warning an investor must accept to go without two-factor sign-in,
 * whether switching it off or declining to set it up. Wording supplied by the
 * fund; the server records the acceptance with the time and IP.
 */
function DisableTwoFactorWarning({ onConfirm, onCancel, busy = false, error = "", confirmLabel = "Disable 2FA" }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-2fa-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="w-full max-w-[560px] rounded-[18px] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.25)]">
        <h2 id="disable-2fa-title" className="text-[18px] font-semibold text-[#111111]">
          Disable Two-Factor Authentication (2FA)?
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[#374151]">
          Two-factor authentication provides an additional layer of security for
          your account. Disabling it increases the risk of unauthorized access,
          hacking, and potential exposure of personal and financial information.
        </p>
        <p className="mt-3 text-[14px] leading-6 text-[#374151]">
          By choosing to disable 2FA, you acknowledge and accept these increased
          risks.{" "}
          <strong className="text-[#111111]">
            Access Properties LLC (AP) shall not be liable for losses or damages
            resulting from your decision to disable this protection, to the
            extent permitted by applicable law.
          </strong>
        </p>

        <label className="mt-4 flex items-start gap-2 text-[14px] text-[#111111]">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#111111]"
          />
          I understand and accept the risks of disabling two-factor authentication.
        </label>

        {error ? (
          <p className="mt-3 rounded-[10px] bg-[#fdecea] p-2.5 text-[13px] text-[#7a2e26]">{error}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-[10px] bg-[#111111] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-60"
          >
            Keep 2FA on
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!accepted || busy}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#ba645b]/40 bg-white px-4 text-sm font-medium text-[#7a2e26] transition hover:bg-[#fdecea] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisableTwoFactorWarning;
