import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import TwoFactorManager from "../../components/security/TwoFactorManager";
import DisableTwoFactorWarning from "../../components/security/DisableTwoFactorWarning";
import { investorTwoFactor, logout } from "../../services/investorPortalService";
import { twoFactorError } from "../../services/twoFactorService";

/**
 * Where an investor without two-factor lands. It is required: the API answers
 * nothing else until they either set it up or decline it by accepting the risk
 * warning. Outside the portal layout, which would otherwise load data the API
 * refuses.
 */
function TwoFactorSetupPage() {
  const navigate = useNavigate();
  const [warning, setWarning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const continueWithout = async () => {
    setBusy(true);
    setError("");
    try {
      await investorTwoFactor.optOut();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(twoFactorError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-12">
      <div className="mx-auto w-full max-w-[560px]">
        <img src="/assets/AP.png" alt="Access Properties" className="mx-auto h-16 w-16 object-contain" />
        <div className="mt-6 rounded-[20px] bg-white p-7 shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
          <h1 className="font-display text-[28px] leading-tight text-[#111111]">
            Protect your account
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
            Set up two-factor sign-in: as well as your password, signing in will
            ask for a code from an authenticator app on your phone.
          </p>

          <div className="mt-6">
            <TwoFactorManager
              api={investorTwoFactor}
              onEnabled={() => navigate("/dashboard", { replace: true })}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 text-[13px]">
            <button
              type="button"
              onClick={() => setWarning(true)}
              className="text-[#6b7280] underline decoration-black/20 underline-offset-[3px] hover:text-[#111111]"
            >
              Continue without two-factor authentication
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
              className="inline-flex items-center gap-1.5 text-[#6b7280] hover:text-[#111111]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {warning ? (
        <DisableTwoFactorWarning
          busy={busy}
          error={error}
          confirmLabel="Continue without 2FA"
          onCancel={() => {
            setWarning(false);
            setError("");
          }}
          onConfirm={continueWithout}
        />
      ) : null}
    </div>
  );
}

export default TwoFactorSetupPage;
