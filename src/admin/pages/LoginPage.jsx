import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { login } from "../../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (typeof window !== "undefined" && window.localStorage.getItem("access_admin_token")) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        "Unable to sign in. Check your credentials.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3ee] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] bg-white/95 p-8 shadow-soft">
        <div className="text-center">
          <p className="metric-kicker">Access Properties</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Admin sign in</h1>
          <p className="mt-2 text-sm text-gray-500">
            Use your operations credentials to access the admin console.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </span>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-[14px] border border-black/5 bg-white pl-10 pr-4 text-sm text-ink shadow-soft outline-none placeholder:text-gray-400 focus:border-teal-600"
                placeholder="admin@accessproperties.test"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Password
            </span>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-[14px] border border-black/5 bg-white pl-10 pr-4 text-sm text-ink shadow-soft outline-none placeholder:text-gray-400 focus:border-teal-600"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error ? (
            <div className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-[14px] bg-[#123438] text-sm font-semibold text-white shadow-soft transition hover:bg-[#0d2528] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
