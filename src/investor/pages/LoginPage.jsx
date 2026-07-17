import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { login } from "../../services/investorPortalService";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[440px] flex-col items-center justify-center">
        <img
          src="/assets/AP.png"
          alt="Access Properties"
          className="h-24 w-24 object-contain"
        />

        <h1 className="font-display mt-6 text-center text-[44px] font-semibold leading-[1.02] text-[#111111] sm:text-[48px]">
          Sign in.
        </h1>

        <p className="mt-4 max-w-[360px] text-center text-[14px] leading-6 text-[#8a8f98]">
          Continue your accredited investor onboarding steps and check on the
          status of your investment account.
        </p>

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

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
                Password
              </span>
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-[#111111] underline decoration-black/40 underline-offset-[3px] transition hover:text-[#374151]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-[50px] w-full rounded-[10px] border border-black/10 bg-[#fafafa] px-4 pr-12 text-[15px] text-[#111111] transition placeholder:text-[#9ca3af] focus:border-black/35 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#4b5563] transition hover:text-[#111111]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#6b7280]">
          New to Access Properties?{" "}
          <a
            href="/"
            className="font-medium text-[#111111] underline decoration-black/40 underline-offset-[3px] transition hover:text-[#374151]"
          >
            Start your application
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
