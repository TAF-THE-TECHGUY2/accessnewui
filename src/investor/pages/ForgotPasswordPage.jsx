import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";

import { requestPasswordReset } from "../../services/investorPortalService";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset({ email });
      setSent(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send the reset link. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
          Forgot password.
        </h1>

        <p className="mt-4 max-w-[360px] text-center text-[14px] leading-6 text-[#8a8f98]">
          Enter the email linked to your investor account and we&rsquo;ll send
          you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-8 w-full rounded-[20px] bg-white p-7 text-center shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
            <MailCheck className="mx-auto h-10 w-10 text-[#111111]" />
            <p className="mt-4 text-[15px] font-medium text-[#111111]">
              Check your inbox
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
              If an account exists for <span className="font-medium text-[#111111]">{email}</span>,
              you&rsquo;ll receive a password reset link shortly. The link
              expires in 60 minutes.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937]"
            >
              Back to sign in
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
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-[50px] w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-4 text-[15px] text-[#111111] transition placeholder:text-[#9ca3af] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="name@email.com"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send reset link
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

export default ForgotPasswordPage;
