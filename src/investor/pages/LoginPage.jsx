import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { login } from "../../services/investorPortalService";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign in. Check your credentials.";
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

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-[460px] flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
          Access Properties · Investor Portal
        </p>
        <h1 className="font-display mt-4 text-[44px] leading-[1.02] text-[#111111] sm:text-[52px]">
          Sign in.
        </h1>
        <div className="mt-6 h-px w-[176px] bg-black/10" />
        <p className="mt-6 text-[16px] leading-8 text-[#4b5563]">
          Continue your onboarding steps and check on the status of your
          investment.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-[24px] border border-black/10 bg-white p-7 shadow-[0_24px_44px_rgba(17,24,39,0.08)]"
        >
          {error ? (
            <div className="mb-5 rounded-[14px] border border-[#ba645b]/20 bg-[#fdecea] p-3 text-[13px] font-medium text-[#7a2e26]">
              {error}
            </div>
          ) : null}

          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-[54px] w-full rounded-[16px] border border-black/10 bg-white px-4 text-[15px] text-[#111111] shadow-[0_10px_20px_rgba(17,24,39,0.04)] transition placeholder:text-[#9ca3af] focus:border-black/35 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-[54px] w-full rounded-[16px] border border-black/10 bg-white px-4 text-[15px] text-[#111111] shadow-[0_10px_20px_rgba(17,24,39,0.04)] transition placeholder:text-[#9ca3af] focus:border-black/35 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-black px-5 text-[16px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#6b7280]">
          New to Access Properties?{" "}
          <a
            href="/"
            className="font-medium text-[#111111] underline decoration-black/30 underline-offset-[5px] transition hover:text-[#374151]"
          >
            Start your application
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
