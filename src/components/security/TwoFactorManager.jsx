import { useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

import { twoFactorError } from "../../services/twoFactorService";

const inputClass =
  "h-11 w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-3 text-sm text-[#111111] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10";
const primaryClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#111111] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-black/15 bg-white px-4 text-sm font-medium text-[#111111] transition hover:bg-[#fafafa] disabled:opacity-60";

function CodeInput({ value, onChange, autoFocus = false }) {
  return (
    <input
      autoFocus={autoFocus}
      required
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={7}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="6-digit code"
      className={`${inputClass} max-w-[180px] text-center font-mono tracking-[0.25em]`}
    />
  );
}

/** Shown once, right after they are generated. */
function RecoveryCodes({ codes, onDone }) {
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the codes are on screen to copy by hand.
    }
  };

  const download = () => {
    const blob = new Blob(
      [`Access Properties — two-factor recovery codes\nEach code works once.\n\n${text}\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "access-properties-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[12px] border border-[#b77d38]/25 bg-[#fdf6ec] p-3 text-[13px] leading-5 text-[#7a5222]">
        <strong>Save these recovery codes now.</strong> If you lose your phone,
        each one gets you in once. They will not be shown again.
      </div>
      <ul className="grid grid-cols-2 gap-2 rounded-[12px] bg-[#f7f5f1] p-4 font-mono text-sm text-[#111111]">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={secondaryClass}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" onClick={download} className={secondaryClass}>
          <Download className="h-4 w-4" />
          Download
        </button>
        <button type="button" onClick={onDone} className={primaryClass}>
          I've saved them
        </button>
      </div>
    </div>
  );
}

/**
 * Set up and manage authenticator sign-in for the signed-in account.
 *
 * `api` is adminTwoFactor or investorTwoFactor. `canDisable` is false for
 * admins, for whom it is required. `onEnabled` fires once setup is finished
 * and the recovery codes have been acknowledged.
 */
function TwoFactorManager({ api, canDisable = true, onEnabled }) {
  const [status, setStatus] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [setup, setSetup] = useState(null);
  const [codes, setCodes] = useState(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(null); // "regenerate" | "disable"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.status().then(setStatus).catch((err) => setLoadError(twoFactorError(err)));
  }, [api]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (err) {
      setError(twoFactorError(err));
    } finally {
      setBusy(false);
    }
  };

  const begin = () => run(async () => setSetup(await api.setup()));

  const confirm = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await api.confirm(code);
      setCodes(data.recoveryCodes);
      setStatus(data.status);
      setSetup(null);
      setCode("");
    });
  };

  const regenerate = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await api.regenerateRecoveryCodes(code);
      setCodes(data.recoveryCodes);
      setMode(null);
      setCode("");
    });
  };

  const disable = (e) => {
    e.preventDefault();
    run(async () => {
      setStatus(await api.disable({ password, code }));
      setMode(null);
      setCode("");
      setPassword("");
      setNotice("Two-factor sign-in is off.");
    });
  };

  const forget = () =>
    run(async () => {
      setStatus(await api.forgetDevices());
      setNotice("Every remembered device will be asked for a code next time.");
    });

  if (loadError) return <p className="text-sm text-[#7a2e26]">{loadError}</p>;
  if (!status) {
    return (
      <p className="flex items-center gap-2 text-sm text-[#6b7280]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  }

  const errorBox = error ? (
    <div className="rounded-[12px] border border-[#ba645b]/20 bg-[#fdecea] p-3 text-[13px] font-medium text-[#7a2e26]">
      {error}
    </div>
  ) : null;

  if (codes) {
    return (
      <RecoveryCodes
        codes={codes}
        onDone={() => {
          setCodes(null);
          onEnabled?.();
        }}
      />
    );
  }

  if (setup) {
    return (
      <form onSubmit={confirm} className="space-y-5">
        <ol className="list-decimal space-y-1 pl-5 text-[13px] leading-6 text-[#374151]">
          <li>
            Open your authenticator app — Microsoft Authenticator, Google
            Authenticator, Authy or 1Password all work.
          </li>
          <li>Add an account and scan this QR code.</li>
          <li>Enter the 6-digit code the app shows.</li>
        </ol>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/* An <img>, not inline markup: the SVG is ours, but an image
              cannot run anything whatever it contains. */}
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(setup.qrSvg)}`}
            alt="QR code for your authenticator app"
            width={180}
            height={180}
            className="rounded-[12px] border border-black/10 bg-white p-2"
          />
          <div className="min-w-0 text-[13px] text-[#6b7280]">
            <p>Can't scan it? Enter this key instead:</p>
            <p className="mt-1 break-all font-mono text-sm text-[#111111]">
              {setup.secret.match(/.{1,4}/g).join(" ")}
            </p>
          </div>
        </div>
        {errorBox}
        <div className="flex flex-wrap items-center gap-2">
          <CodeInput value={code} onChange={setCode} autoFocus />
          <button type="submit" disabled={busy} className={primaryClass}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Turn on
          </button>
        </div>
      </form>
    );
  }

  if (!status.enabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-[#9ca3af]" />
          <p className="text-[13px] leading-6 text-[#374151]">
            Two-factor sign-in is <strong>off</strong>. Turn it on and signing
            in will also need a code from an authenticator app on your phone,
            so a stolen password is not enough on its own.
          </p>
        </div>
        {notice ? <p className="text-[13px] text-[#4d8a63]">{notice}</p> : null}
        {errorBox}
        <button type="button" onClick={begin} disabled={busy} className={primaryClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Set up two-factor sign-in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4d8a63]" />
        <div className="text-[13px] leading-6 text-[#374151]">
          <p>
            Two-factor sign-in is <strong>on</strong>
            {status.confirmedAt
              ? ` since ${new Date(status.confirmedAt).toLocaleDateString()}`
              : ""}
            .
          </p>
          <p className="text-[#6b7280]">
            {status.recoveryCodesLeft} recovery code
            {status.recoveryCodesLeft === 1 ? "" : "s"} left ·{" "}
            {status.trustedDevices} remembered device
            {status.trustedDevices === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {notice ? <p className="text-[13px] text-[#4d8a63]">{notice}</p> : null}
      {errorBox}

      {mode === "regenerate" ? (
        <form onSubmit={regenerate} className="flex flex-wrap items-center gap-2">
          <CodeInput value={code} onChange={setCode} autoFocus />
          <button type="submit" disabled={busy} className={primaryClass}>
            New recovery codes
          </button>
          <button type="button" onClick={() => setMode(null)} className={secondaryClass}>
            Cancel
          </button>
        </form>
      ) : mode === "disable" ? (
        <form onSubmit={disable} className="space-y-2">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className={`${inputClass} max-w-[280px]`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <CodeInput value={code} onChange={setCode} />
            <button type="submit" disabled={busy} className={primaryClass}>
              Turn off
            </button>
            <button type="button" onClick={() => setMode(null)} className={secondaryClass}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode("regenerate")} className={secondaryClass}>
            New recovery codes
          </button>
          {status.trustedDevices > 0 ? (
            <button type="button" onClick={forget} disabled={busy} className={secondaryClass}>
              Forget remembered devices
            </button>
          ) : null}
          {canDisable ? (
            <button type="button" onClick={() => setMode("disable")} className={secondaryClass}>
              Turn off
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default TwoFactorManager;
