import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  FileText,
  Landmark,
  Loader2,
  LogOut,
  Lock,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import PersonaInquiry from "persona-react";

import LoadingState from "../../admin/components/LoadingState";
import EmptyState from "../../admin/components/EmptyState";
import StripeFundingPanel from "../components/StripeFundingPanel";
import PortalLayout from "../portal/PortalLayout";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import {
  fetchPortalDocuments,
  logout,
  me,
  recordPersonaInquiryCompletion,
  startInvestReadyVerification,
  startPersonaInquiry,
} from "../../services/investorPortalService";
import {
  CATEGORY_META,
  DocumentRow,
} from "../portal/pages/DocumentsPage";

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

// The offering-documents step is optional and has no backend status, so the
// "viewed" flag lives in localStorage, keyed per investor.
const offeringDocsViewedKey = (investorId) =>
  `ap_offering_docs_viewed_${investorId}`;

function hasViewedOfferingDocs(investorId) {
  try {
    return localStorage.getItem(offeringDocsViewedKey(investorId)) === "1";
  } catch {
    return false;
  }
}

function markOfferingDocsViewed(investorId) {
  try {
    localStorage.setItem(offeringDocsViewedKey(investorId), "1");
  } catch {
    // Ignore storage errors — the step is optional either way.
  }
}

function buildSteps(investor, offeringDocsViewed) {
  const status = investor.investmentStatus;
  const kyc = investor.kycStatus;
  const accreditation = investor.accreditationVerificationStatus;
  const docSigning = investor.documentSigningStatus;

  // Identity (Persona) is "done from the investor's POV" once they've
  // submitted or been approved. Anchor on kycStatus, not accreditation.
  const identityComplete =
    kyc === "submitted" ||
    kyc === "approved" ||
    isStepCompleted(status, [
      "awaiting_documents",
      "awaiting_legal_approval",
      "awaiting_funding",
      "funds_sent",
      "funds_confirmed",
      "active",
    ]);

  return [
    {
      key: "review",
      title: "Review offering documents",
      description:
        "Access, review, and download the current offering documents before continuing.",
      icon: FileText,
      action: "review-documents",
      actionLabel: "View Documents",
      // Optional: never gates, locks, or counts toward onboarding completion.
      optional: true,
      complete: offeringDocsViewed,
      current: false,
    },
    {
      key: "identity",
      title: "Verify your identity",
      description:
        "Confirm your identity with a government-issued ID and a quick selfie.",
      icon: User,
      action: "persona",
      complete: identityComplete,
      current: !identityComplete && status === "awaiting_kyc",
    },
    {
      key: "accreditation",
      title: "Verify accredited investor status",
      description:
        "Complete accredited investor verification through our secure third-party process.",
      icon: ShieldCheck,
      action: "verify-investor",
      complete: accreditation === "verification_approved",
      current:
        accreditation === "verification_required" ||
        (status === "awaiting_accreditation_verification" &&
          accreditation !== "verification_approved"),
    },
    {
      key: "documents",
      title: "Complete subscription documents",
      description:
        "Review and electronically sign the subscription agreement and related documents.",
      icon: FileSignature,
      action: "docusign",
      placeholder: true,
      complete: docSigning === "completed" || docSigning === "signed",
      current:
        status === "awaiting_documents" || status === "awaiting_legal_approval",
    },
    {
      key: "funding",
      title: "Fund your subscription",
      description:
        "Link your bank account and submit your investment by ACH.",
      icon: Landmark,
      placeholder: true,
      complete: ["funds_confirmed", "active"].includes(status),
      current:
        status === "awaiting_funding" || status === "funds_sent",
    },
    {
      key: "active",
      title: "Investment confirmed",
      description:
        "Once your subscription is accepted and funds are received, you'll receive confirmation and dashboard access.",
      icon: CheckCircle2,
      complete: status === "active",
      current: status === "funds_confirmed",
    },
  ];
}

function StepRow({ step, stepNumber, onStart, isCurrent, locked, busy }) {
  const Icon = step.icon;
  const stateLabel = step.complete
    ? "Completed"
    : isCurrent
    ? "In progress"
    : locked
    ? "Locked"
    : step.optional
    ? "Available"
    : "Pending";
  // Badge colors per the reference design: beige for available, blue for
  // in progress, gray for locked/pending, black for completed.
  const badgeStyle = step.complete
    ? "bg-black text-white"
    : isCurrent
    ? "bg-[#dbeafe] text-[#1e40af]"
    : locked
    ? "bg-[#f3f4f6] text-[#6b7280]"
    : "bg-[#eee5cf] text-[#6b5d3f]";
  const ring = step.complete
    ? "border-black/10 bg-white"
    : isCurrent
    ? "border-black bg-white shadow-[0_14px_28px_rgba(17,24,39,0.08)]"
    : "border-black/10 bg-white";

  return (
    <li className={`rounded-[20px] border p-6 transition ${ring}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${
              step.complete
                ? "bg-black text-white"
                : isCurrent
                ? "bg-[#dbeafe] text-[#111111]"
                : "bg-[#f4efe4] text-[#111111]"
            }`}
          >
            {step.complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>

          <div>
            <span
              className={`inline-flex w-fit rounded-[6px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badgeStyle}`}
            >
              {stateLabel}
            </span>
            <h3 className="font-display mt-2 flex items-baseline gap-2 text-[20px] leading-tight text-[#111111]">
              <span>{stepNumber}.</span>
              <span>{step.title}</span>
            </h3>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#4b5563]">
              {step.description}
            </p>
            {step.placeholder && isCurrent ? (
              <p className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#ba645b]">
                Coming soon — your admin will contact you to complete this step.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center md:min-w-[200px] md:justify-center md:border-l md:border-black/[0.06] md:pl-6">
          {step.complete && !step.optional ? (
            <span className="inline-flex items-center gap-1.5 rounded-[12px] border border-black/10 bg-white px-3 py-2 text-[12px] font-medium text-[#1f2937]">
              <BadgeCheck className="h-4 w-4" /> Done
            </span>
          ) : (isCurrent || step.optional) && !step.placeholder && step.action ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onStart(step)}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-black px-5 text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9ca3af] disabled:shadow-none"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {step.actionLabel || "Continue"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          ) : locked ? (
            <span className="inline-flex items-center gap-2 text-[14px] text-[#9ca3af]">
              <Lock className="h-4 w-4" /> Locked
            </span>
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

function OfferingDocumentsModal({ onClose }) {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortalDocuments()
      .then(setDocs)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load documents.")
      );
  }, []);

  const categories = docs
    ? Object.entries(docs).filter(([, list]) => list.length > 0)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-[680px] flex-col rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.18)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
              Step 1 · Offering documents
            </p>
            <h3 className="font-display mt-2 text-[26px] leading-tight text-[#111111]">
              Review offering documents
            </h3>
            <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
              Access, review, and download the current offering documents.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-[#6b7280] transition hover:border-black/30 hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          {error ? (
            <p className="rounded-[12px] border border-[#ba645b]/20 bg-white p-4 text-[13px] text-[#ba645b]">
              {error}
            </p>
          ) : !docs ? (
            <p className="py-8 text-center text-sm text-[#6b7280]">
              Loading documents…
            </p>
          ) : categories.length === 0 ? (
            <p className="rounded-[12px] bg-[#fafaf8] px-4 py-8 text-center text-sm text-[#9ca3af]">
              No offering documents are available yet. Check back soon.
            </p>
          ) : (
            categories.map(([category, list]) => (
              <section key={category}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  {CATEGORY_META[category]?.label || category}
                </p>
                <ul className="space-y-2">
                  {list.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </ul>
              </section>
            ))
          )}
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
  const [showDocuments, setShowDocuments] = useState(false);
  const [docsViewed, setDocsViewed] = useState(false);

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
        setDocsViewed(hasViewedOfferingDocs(data.id));
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

  const steps = useMemo(
    () => (investor ? buildSteps(investor, docsViewed) : []),
    [investor, docsViewed]
  );
  const currentStepKey = useMemo(() => {
    if (!investor) return null;
    const current = steps.find((s) => !s.complete && s.current);
    if (current) return current.key;
    // Optional steps never become "current" — they don't gate progression.
    return steps.find((s) => !s.complete && !s.optional)?.key ?? null;
  }, [steps, investor]);

  const handleStart = async (step) => {
    setActionError(null);
    setBusyStep(step.key);
    try {
      if (step.action === "review-documents") {
        setShowDocuments(true);
        markOfferingDocsViewed(investor.id);
        setDocsViewed(true);
      } else if (step.action === "persona") {
        const refreshed = await startPersonaInquiry();
        setInvestor(refreshed);
        setShowPersona(true);
      } else if (step.action === "verify-investor") {
        const response = await startInvestReadyVerification();
        if (response?.authorizationUrl) {
          window.location.href = response.authorizationUrl;
          return;
        }
        setActionError("InvestReady did not return an authorization URL.");
      }
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

  // Fully-onboarded investors land in the post-onboarding portal (Annex 3 spec).
  // The onboarding tracker below is shown until ALL steps are complete — gating
  // just on `investment_status === "active"` is too loose because parallel mode
  // (or admin overrides) can flip funding to active while other steps are still
  // pending. Every step must report complete: true.
  // Optional steps (e.g. reviewing offering documents) are excluded — skipping
  // them must not keep an otherwise fully-onboarded investor out of the portal.
  const requiredSteps = steps.filter((s) => !s.optional);
  const onboardingComplete =
    requiredSteps.length > 0 && requiredSteps.every((s) => s.complete);
  if (onboardingComplete) {
    return <PortalLayout investor={investor} setInvestor={setInvestor} />;
  }

  // Per the reference design, the header indicator points at the first
  // incomplete step — including the optional review step — purely as a visual
  // cue; it has no effect on gating.
  const currentStepIndex = steps.findIndex((s) => !s.complete);
  const activeDot = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <OnboardingShell
      dots={steps.length}
      activeDot={activeDot}
      stepLabel={`STEP ${activeDot + 1} OF ${steps.length}`}
      showFootnotes={false}
    >
      <div className="mx-auto max-w-[960px]">
        {actionError ? (
          <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-[#ba645b]/20 bg-white p-4 text-[13px] text-[#ba645b]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        ) : null}

        <ol className="space-y-3">
          {steps.map((step, index) => {
            const parallelMode = investor?.platform?.allowParallelOnboarding === true;
            // Optional steps neither lock nor count toward unlocking: skipping
            // the offering-documents review must leave every other step exactly
            // as it would be without it.
            const previousCompleted = steps
              .slice(0, index)
              .every((s) => s.complete || s.optional);
            const isCurrent = parallelMode
              ? !step.complete
              : step.key === currentStepKey;
            const locked =
              parallelMode || step.optional
                ? false
                : !step.complete && !previousCompleted;

            if (step.key === "funding" && isCurrent && !locked && !step.complete) {
              return (
                <li key={step.key}>
                  <StripeFundingPanel
                    investor={investor}
                    onInvestorUpdated={(updated) => setInvestor(updated)}
                  />
                </li>
              );
            }

            return (
              <StepRow
                key={step.key}
                step={step}
                stepNumber={index + 1}
                onStart={handleStart}
                isCurrent={isCurrent && !locked}
                locked={locked}
                busy={busyStep === step.key}
              />
            );
          })}
        </ol>

        <footer className="mt-10 flex items-center justify-between text-[13px] text-[#6b7280]">
          <p>
            Need help?{" "}
            <a
              href="mailto:investors@ap.boston"
              className="text-[#111111] underline decoration-black/30 underline-offset-[5px] transition hover:decoration-black"
            >
              Contact us
            </a>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-[12px] text-[#6b7280] underline decoration-black/20 underline-offset-[5px] transition hover:text-[#111111]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </footer>
      </div>

      {showDocuments ? (
        <OfferingDocumentsModal onClose={() => setShowDocuments(false)} />
      ) : null}

      {showPersona ? (
        <PersonaModal
          investor={investor}
          onClose={() => setShowPersona(false)}
          onCompleted={handlePersonaComplete}
          onError={(message) => setActionError(message)}
        />
      ) : null}
    </OnboardingShell>
  );
}

export default DashboardPage;
