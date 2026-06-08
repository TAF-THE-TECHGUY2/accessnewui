import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { completeInvestReadyVerification } from "../../services/investorPortalService";

function InvestReadyCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");

    if (oauthError) {
      setStatus("error");
      setError(params.get("error_description") || oauthError);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setError("Missing code or state in the redirect URL.");
      return;
    }

    completeInvestReadyVerification({ code, state })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          "We could not complete the InvestReady verification. Please try again.";
        setStatus("error");
        setError(message);
      });
  }, [params, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f5f5] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-[0_18px_34px_rgba(17,24,39,0.08)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
          InvestReady
        </p>
        {status === "processing" && (
          <>
            <h1 className="font-display mt-4 text-[24px] text-[#111111]">
              Finalizing your verification...
            </h1>
            <p className="mt-3 text-sm text-[#4b5563]">
              Confirming your accreditation status with InvestReady. This takes a few seconds.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="font-display mt-4 text-[24px] text-[#111111]">
              Verification linked.
            </h1>
            <p className="mt-3 text-sm text-[#4b5563]">
              Returning you to your dashboard...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-display mt-4 text-[24px] text-[#111111]">
              We hit a snag.
            </h1>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-6 h-11 rounded-[14px] bg-black px-5 text-sm font-semibold text-white"
            >
              Back to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default InvestReadyCallbackPage;
