import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

import TwoFactorManager from "../../components/security/TwoFactorManager";
import { adminTwoFactor, logout, me } from "../../services/authService";

/**
 * Sign-in security for the signed-in admin. Outside AdminLayout on purpose:
 * until two-factor is on, the API refuses everything the layout would load,
 * and this page has to work on its own.
 */
function TwoFactorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    me().then(setUser).catch(() => navigate("/admin/login", { replace: true }));
  }, [navigate]);

  const required = user && !user.twoFactorEnabled;

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3ee] px-4 py-10">
      <div className="w-full max-w-lg rounded-[24px] bg-white/95 p-8 shadow-soft">
        <p className="metric-kicker">Access Properties</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Two-factor sign-in</h1>
        {required ? (
          <p className="mt-2 text-sm text-gray-500">
            Admin accounts need an authenticator app as well as a password. Set
            it up to continue to the admin console.
          </p>
        ) : null}

        <div className="mt-6">
          {user ? (
            <TwoFactorManager
              api={adminTwoFactor}
              canDisable={false}
              onEnabled={() => {
                setUser({ ...user, twoFactorEnabled: true });
                navigate("/admin/dashboard", { replace: true });
              }}
            />
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
          {required ? (
            <span />
          ) : (
            <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:text-teal-900">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/admin/login", { replace: true });
            }}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorPage;
