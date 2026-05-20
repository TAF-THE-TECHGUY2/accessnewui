import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Loader2,
  LogOut,
  Lock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  UserSearch,
} from "lucide-react";
import PersonaInquiry from "persona-react";

import LoadingState from "../../admin/components/LoadingState";
import EmptyState from "../../admin/components/EmptyState";
import {
  logout,
  me,
  recordPersonaInquiryCompletion,
  startPersonaInquiry,
} from "../../services/investorPortalService";

const PERSONA_TEMPLATE_ID = import.meta.env.VITE_PERSONA_TEMPLATE_ID || "";
const PERSONA_ENVIRONMENT_ID =
  import.meta.env.VITE_PERSONA_ENVIRONMENT_ID || undefined;
const WEFUNDER_URL =
  import.meta.env.VITE_WEFUNDER_REDIRECT_URL || "https://wefunder.com";

const PHASE_3A_STATUSES = [
  "awaiting_kyc",
  "awaiting_accreditation_verification",
  "awaiting_documents",
  "awaiting_legal_approval",
  "awaiting_funding",
  "funds_sent",
  "funds_confirmed",
  "active",
];

function isStepCompleted(status, completionStatuses) {
  return completionStatuses.includes(status);
}

function buildSteps(investor) {
  const status = investor.investmentStatus;
  const accreditation = investor.accreditationVerificationStatus;
  const docSigning = investor.documentSigningStatus;

  return [
    {
      key: "identity",
      title: "Verify your identity",
      description:
        "Confirm who you are with a government ID and a quick selfie. Powered by Persona.",
      icon: UserSearch,
      provider: "Persona",
      action: "persona",
      complete:
        accreditation === "verification_submitted" ||
        accreditation === "verification_approved" ||
        isStepCompleted(status, [
          "awaiting_documents",
          "awaiting_legal_approval",
          "awaiting_funding",
          "funds_sent",
          "funds_confirmed",
          "active",
        ]),
      current:
        status === "awaiting_kyc" ||
        status === "awaiting_accreditation_verification",
    },
    {
      key: "accreditation",
      title: "Verify accredited status",
      description:
        "Confirm you meet the SEC accreditation criteria. Powered by verifyinvestor.com.",
      icon: ShieldCheck,
      provider: "verifyinvestor.com",
      action: "verify-investor",
      placeholder: true,
      complete: accreditation === "verification_approved",
      current: status === "awaiting_documents" && accreditation !== "verification_approved",
    },
    {
      key: "documents",
      title: "Sign subscription documents",
      description:
        "Review and sign the subscription agreement and related documents. Powered by DocuSign.",
      icon: FileSignature,
      provider: "DocuSign",
      action: "docusign",
      placeholder: true,
      complete: docSigning === "completed" || docSigning === "signed",
      current:
        status === "awaiting_documents" || status === "awaiting_legal_approval",
    },
    {
      key: "funding",
      title: "Receive funding instructions",
      description:
        "Once your application is approved, you'll get wire instructions here.",
      icon: PiggyBank,
      placeholder: true,
      complete: ["funds_sent", "funds_confirmed", "active"].includes(status),
      current: status === "awaiting_funding",
    },
    {
      key: "active",
      title: "Investment activated",
      description:
        "Your investment is live. You'll receive a confirmation email and dashboard access.",
      icon: Sparkles,
      complete: status === "active",
      current: status === "funds_confirmed",
    },
  ];
}

function StepRow({ step, onStart, isCurrent, locked, busy }) {
  const Icon = step.icon;
  const stateLabel = step.complete
    ? "Completed"
    : isCurrent
    ? "In progress"
    : locked
    ? "Locked"
    : "Pending";
  const ring = step.complete
    ? "border-black/10 bg-white"
    : isCurrent
    ? "border-black bg-white shadow-[0_14px_28px_rgba(17,24,39,0.08)]"
    : "border-black/10 bg-white/60";

  return (
    <li className={`rounded-[22px] border p-6 transition ${ring}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border ${
              step.complete
                ? "border-black/10 bg-black text-white"
                : isCurrent
                ? "border-black/15 bg-[#f5f5f5] text-[#111111]"
                : "border-black/10 bg-white text-[#9ca3af]"
            }`}
          >
            {step.complete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : locked ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
              {stateLabel}
              {step.provider ? ` · ${step.provider}` : ""}
            </p>
            <p className="font-display mt-2 text-[20px] leading-tight text-[#111111]">
              {step.title}
            </p>
            <p className="mt-2 max-w-xl text-[14px] leading-7 text-[#4b5563]">
              {step.description}
            </p>
            {step.placeholder && isCurrent ? (
              <p className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#ba645b]">
                Coming soon — your admin will contact you to complete this step.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {step.complete ? (
            <span className="inline-flex items-center gap-1.5 rounded-[12px] border border-black/10 bg-white px-3 py-2 text-[12px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.05)]">
              <BadgeCheck className="h-4 w-4" /> Done
            </span>
          ) : isCurrent && !step.placeholder && step.action ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStart(step)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-black px-5 text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Start
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function PersonaModal({ investor, onClose, onCompleted, onError }) {
  if (!PERSONA_TEMPLATE_ID) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-[480px] rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_26px_64px_rgba(17,24,39,0.16)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
            Configuration
          </p>
          <h3 className="font-display mt-3 text-[26px] leading-tight text-[#111111]">
            Persona not configured
          </h3>
          <p className="mt-3 text-[14px] leading-7 text-[#4b5563]">
            <code className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[12px]">
              VITE_PERSONA_TEMPLATE_ID
            </code>{" "}
            is empty. Ask your admin to configure it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-[760px] flex-col rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.18)]">
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
            Step 1 · Persona
          </p>
          <h3 className="font-display mt-2 text-[26px] leading-tight text-[#111111]">
            Identity verification
          </h3>
        </div>
        <div className="h-[640px] min-h-[640px] overflow-hidden rounded-[16px] border border-black/10 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0">
          <PersonaInquiry
            templateId={PERSONA_TEMPLATE_ID}
            environmentId={PERSONA_ENVIRONMENT_ID}
            referenceId={investor.id}
            fields={{
              nameFirst: investor.name?.split(" ")[0],
              nameLast: investor.name?.split(" ").slice(1).join(" "),
              emailAddress: investor.email,
              phoneNumber: investor.phone,
            }}
            onComplete={({ inquiryId, status }) =>
              onCompleted({ inquiryId, status })
            }
            onCancel={({ inquiryId }) => {
              if (inquiryId) {
                onCompleted({ inquiryId, status: "cancelled" });
              } else {
                onClose();
              }
            }}
            onError={(error) => onError(error?.message || "Persona error")}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [busyStep, setBusyStep] = useState(null);
  const [showPersona, setShowPersona] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await me();
        if (cancelled) return;

        if (data.accreditationStatus !== "accredited") {
          window.location.replace(WEFUNDER_URL);
          return;
        }

        setInvestor(data);
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setActionError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const steps = useMemo(() => (investor ? buildSteps(investor) : []), [investor]);
  const currentStepKey = useMemo(() => {
    if (!investor) return null;
    const current = steps.find((s) => !s.complete && s.current);
    if (current) return current.key;
    return steps.find((s) => !s.complete)?.key ?? null;
  }, [steps, investor]);

  const handleStart = async (step) => {
    if (step.action !== "persona") return;
    setActionError(null);
    setBusyStep(step.key);
    try {
      const refreshed = await startPersonaInquiry();
      setInvestor(refreshed);
      setShowPersona(true);
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not start verification."
      );
    } finally {
      setBusyStep(null);
    }
  };

  const handlePersonaComplete = async ({ inquiryId, status }) => {
    setBusyStep("identity");
    try {
      const refreshed = await recordPersonaInquiryCompletion({
        inquiryId,
        status,
      });
      setInvestor(refreshed);
      setShowPersona(false);
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not record verification result."
      );
    } finally {
      setBusyStep(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (!investor) {
    return (
      <EmptyState
        title="No investor profile"
        description="Your account is missing required data. Contact support."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-14">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(229,231,235,0.85),transparent_30%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[960px] px-6">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
              Access Properties · Investor Portal
            </p>
            <h1 className="font-display mt-4 text-[44px] leading-[1.02] text-[#111111] sm:text-[52px]">
              Welcome, {investor.name?.split(" ")[0]}.
            </h1>
            <div className="mt-6 h-px w-[176px] bg-black/10" />
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[#4b5563]">
              Complete the following steps to activate your investment. Each
              step is handled by a trusted partner.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 items-center gap-2 self-start rounded-[14px] border border-black/10 bg-white px-4 text-[14px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-[1px] hover:border-black/35"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        {actionError ? (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-[#ba645b]/20 bg-white p-4 text-[14px] text-[#ba645b] shadow-[0_10px_22px_rgba(17,24,39,0.05)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        ) : null}

        <ol className="space-y-4">
          {steps.map((step, index) => {
            const previousCompleted = steps
              .slice(0, index)
              .every((s) => s.complete);
            const isCurrent = step.key === currentStepKey;
            const locked = !step.complete && !previousCompleted;
            return (
              <StepRow
                key={step.key}
                step={step}
                onStart={handleStart}
                isCurrent={isCurrent && !locked}
                locked={locked}
                busy={busyStep === step.key}
              />
            );
          })}
        </ol>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#6b7280]">
          <p>Need help? Contact your relationship manager.</p>
          <a
            href={WEFUNDER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline decoration-black/30 underline-offset-[5px] transition hover:text-[#111111]"
          >
            Crowdfunding partner <ExternalLink className="h-3 w-3" />
          </a>
        </footer>
      </div>

      {showPersona ? (
        <PersonaModal
          investor={investor}
          onClose={() => setShowPersona(false)}
          onCompleted={handlePersonaComplete}
          onError={(message) => setActionError(message)}
        />
      ) : null}
    </div>
  );
}

export default DashboardPage;
