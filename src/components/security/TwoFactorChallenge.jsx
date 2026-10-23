import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * The code step of sign-in, after a correct password. Shared by the admin and
 * investor sign-in pages, which pass their own button styling.
 */
function TwoFactorChallenge({
  onSubmit,
  onCancel,
  submitting,
  error,
  buttonClassName = "bg-black hover:bg-[#1f2937]",
}) {
  const [useRecovery, setUseRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [remember, setRemember] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    onSubmit(
      useRecovery
        ? { recoveryCode: recoveryCode.trim(), remember }
        : { code: code.replace(/\s+/g, ""), remember },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#111111]" />
        <div>
          <p className="text-[15px] font-semibold text-[#111111]">
            {useRecovery ? "Use a recovery code" : "Enter your authenticator code"}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">
            {useRecovery
              ? "One of the codes you saved when you set up two-factor sign-in. Each works once."
              : "Open your authenticator app (Microsoft Authenticator, Google Authenticator, Authy…) and enter the 6-digit code for Access Properties."}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-[12px] border border-[#ba645b]/20 bg-[#fdecea] p-3 text-[13px] font-medium text-[#7a2e26]">
          {error}
        </div>
      ) : null}

      {useRecovery ? (
        <input
          key="recovery"
          autoFocus
          required
          autoComplete="off"
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value)}
          placeholder="XXXX-XXXX-XXXX"
          className="h-[50px] w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-4 font-mono text-[15px] uppercase tracking-wider text-[#111111] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      ) : (
        <input
          key="code"
          autoFocus
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123 456"
          className="h-[50px] w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-4 text-center font-mono text-[22px] tracking-[0.35em] text-[#111111] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      )}

      <label className="flex items-center gap-2 text-[13px] text-[#374151]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-black/20"
        />
        Remember this device for 30 days
      </label>

      <button
        type="submit"
        disabled={submitting}
        className={`inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Verify
      </button>

      <div className="flex items-center justify-between text-[13px]">
        <button
          type="button"
          onClick={() => setUseRecovery((v) => !v)}
          className="font-medium text-[#111111] underline decoration-black/30 underline-offset-[3px]"
        >
          {useRecovery ? "Use authenticator code instead" : "Lost your phone? Use a recovery code"}
        </button>
        <button type="button" onClick={onCancel} className="text-[#6b7280] hover:text-[#111111]">
          Start over
        </button>
      </div>
    </form>
  );
}

export default TwoFactorChallenge;
