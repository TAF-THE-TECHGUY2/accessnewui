import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { openSigningLink } from "../../services/investorService";

const cardClass =
  "mt-8 w-full rounded-[20px] bg-white p-7 text-center shadow-[0_18px_40px_rgba(17,24,39,0.08)]";

function Shell({ title, children }) {
  return (
    <div className="relative min-h-screen bg-[#f5f5f5] px-4 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(229,231,235,0.85),transparent_30%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[440px] flex-col items-center justify-center">
        <img src="/assets/AP.png" alt="Access Properties" className="h-24 w-24 object-contain" />
        <h1 className="font-display mt-6 text-center text-[40px] font-semibold leading-[1.05] text-[#111111] sm:text-[44px]">
          {title}
        </h1>
        {children}
        <p className="mt-6 text-center text-[13px] text-[#6b7280]">
          Questions? Email{" "}
          <a
            href="mailto:hello@ap.boston"
            className="font-medium text-[#111111] underline decoration-black/40 underline-offset-[3px]"
          >
            hello@ap.boston
          </a>
        </p>
      </div>
    </div>
  );
}

const ICONS = {
  signed: CheckCircle2,
  waiting: Clock,
};

/**
 * The page a signing email links to. It asks the API for a DocuSign session
 * and goes straight there; anything else (already signed, not their turn yet,
 * closed, bad link) is explained here instead.
 */
export function SignPage() {
  const { token = "" } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    openSigningLink(token)
      .then((data) => {
        if (cancelled) return;
        if (data.status === "ready" && data.url) {
          window.location.replace(data.url);
        } else {
          setResult(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            status: "error",
            message: "Signing is not available right now. Please try again in a few minutes.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!result) {
    return (
      <Shell title="Opening documents.">
        <div className={cardClass}>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#111111]" />
          <p className="mt-4 text-[14px] leading-6 text-[#6b7280]">
            Taking you to DocuSign to review and sign.
          </p>
        </div>
      </Shell>
    );
  }

  const Icon = ICONS[result.status] || XCircle;
  const title =
    result.status === "signed"
      ? "Already signed."
      : result.status === "waiting"
        ? "Not ready yet."
        : "Can't open this link.";

  return (
    <Shell title={title}>
      <div className={cardClass}>
        <Icon className="mx-auto h-10 w-10 text-[#111111]" />
        <p className="mt-4 text-[14px] leading-6 text-[#6b7280]">{result.message}</p>
        {result.status === "error" ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-[50px] w-full items-center justify-center rounded-[10px] bg-black px-5 text-[15px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.2)] transition hover:bg-[#1f2937]"
          >
            Try again
          </button>
        ) : null}
      </div>
    </Shell>
  );
}

// DocuSign appends ?event=… to the return URL.
const OUTCOMES = {
  signing_complete: {
    title: "Thank you.",
    message:
      "Your signature has been recorded. We'll email you as soon as everyone has signed. You can close this page.",
    icon: CheckCircle2,
  },
  decline: {
    title: "Signing declined.",
    message: "You declined to sign. If this was a mistake, please contact us and we'll send the documents again.",
    icon: XCircle,
  },
};

/** Where DocuSign sends a signer back to when they finish or leave. */
export function SigningCompletePage() {
  const [searchParams] = useSearchParams();
  const outcome = OUTCOMES[searchParams.get("event")] || {
    title: "Signing paused.",
    message:
      "Nothing has been signed yet. Open the link in your email again whenever you're ready to continue.",
    icon: Clock,
  };
  const Icon = outcome.icon;

  return (
    <Shell title={outcome.title}>
      <div className={cardClass}>
        <Icon className="mx-auto h-10 w-10 text-[#111111]" />
        <p className="mt-4 text-[14px] leading-6 text-[#6b7280]">{outcome.message}</p>
      </div>
    </Shell>
  );
}

export default SignPage;
