import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { resetPassword } from "../../services/investorPortalService";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const linkInvalid = !token || !email;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ email, token, password, passwordConfirmation });
      setDone(true);
    } catch (err) {
      const validationError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      const message =
        validationError ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to reset your password. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 h-[50px] w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-4 pr-12 text-[15px] text-[#111111] transition placeholder:text-[#9ca3af] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10";

  return (
    <div className="relative min-h-screen bg-[#f5f5f5] px-4 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(229,231,235,0.85),transparent_30%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[440px] flex-col items-center justify-center">
        <img
          src="/assets/AP.png"
          alt="Access Properties"
          className="h-24 w-24 object-contain"
        />

        <h1 className="font-display mt-6 text-center text-[44px] font-semibold leading-[1.02] text-[#111111] sm:text-[48px]">
          Reset password.
        </h1>

        <p className="mt-4 max-w-[360px] text-center text-[14px] leading-6 text-[#8a8f98]">
          Choose a new password for your investor account. It must be at least
          8 characters long.
        </p>

        {done ? (
          <div className="mt-8 w-full rounded-[20px] bg-white p-7 text-center shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#111111]" />
            <p className="mt-4 text-[15px] font-medium text-[#111111]">
              Password updated
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
              Your password has been reset. Sign in with your new password to
              continue.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937]"
            >
              Go to sign in
            </Link>
          </div>
        ) : linkInvalid ? (
          <div className="mt-8 w-full rounded-[20px] bg-white p-7 text-center shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
            <p className="text-[15px] font-medium text-[#111111]">
              This reset link is invalid
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
              The link is missing its reset token. Request a new link and try
              again.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937]"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full rounded-[20px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.08)]"
          >
            {error ? (
              <div className="mb-5 rounded-[12px] border border-[#ba645b]/20 bg-[#fdecea] p-3 text-[13px] font-medium text-[#7a2e26]">
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
                New password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 rounded p-1 text-[#4b5563] transition hover:text-[#111111]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            <label className="mt-5 block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
                Confirm new password
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className={inputClass}
                placeholder="••••••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reset password
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-[#6b7280]">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-[#111111] underline decoration-black/40 underline-offset-[3px] transition hover:text-[#374151]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
