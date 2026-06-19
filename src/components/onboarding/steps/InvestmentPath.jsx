import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Info,
  Loader2,
  Users2,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";
import { parseAmount, registerInvestor } from "../../../services/investorService";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const PATHS = [
  {
    id: "direct",
    title: "Direct Access Properties Investment",
    subtitle: "For investors who believe they may qualify as Accredited Investors.",
    minimum: 10000,
    icon: Building2,
    iconWrapClass: "bg-[#111111] text-white",
    selectLabel: "Select Direct Investment Path",
    accreditationStatus: "accredited",
  },
  {
    id: "third-party",
    title: "Third-Party Platform Investment",
    subtitle:
      "For investors who do not qualify as Accredited Investors or prefer an alternative investment pathway.",
    minimum: 100,
    icon: Users2,
    iconWrapClass: "bg-[#f2f1ee] text-[#111111]",
    selectLabel: "Select Third-Party Platform Path",
    accreditationStatus: "not-accredited",
  },
];

function AmountInput({ value, onChange, error, placeholder = "Enter amount" }) {
  return (
    <div className={`flex h-12 items-center rounded-[10px] border bg-white transition focus-within:border-[#111111] ${error ? "border-red-300" : "border-black/15"}`}>
      <span className="grid h-full w-10 place-items-center text-[15px] text-[#9ca3af]">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent pr-3 text-[14px] text-[#111111] outline-none placeholder:text-[#9ca3af]"
      />
    </div>
  );
}

function PathCard({ path, selected, amount, onAmountChange, onSelect, error }) {
  const Icon = path.icon;
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer rounded-[16px] border bg-white p-6 transition sm:p-7 ${
        selected
          ? "border-[#111111] shadow-[0_12px_28px_rgba(17,24,39,0.08)]"
          : "border-black/10 hover:border-black/25"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${path.iconWrapClass}`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-[20px] leading-tight text-[#111111] sm:text-[22px]">
            {path.title}
          </h3>
          <p className="mt-1.5 text-[14px] leading-6 text-[#4b5563]">
            {path.subtitle}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[14px] text-[#4b5563]">
        <span>Minimum Investment:</span>
        <strong className="text-[#111111]">{formatCurrency(path.minimum)}</strong>
      </div>

      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <AmountInput value={amount} onChange={onAmountChange} error={error} />
      </div>
      {error ? (
        <div className="mt-2 flex items-start gap-2 text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-[12px] leading-5">{error}</p>
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-2.5">
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
            selected ? "border-[#111111] bg-[#111111]" : "border-black/25 bg-white"
          }`}
        >
          {selected ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
        </span>
        <p className={`text-[14px] font-medium ${selected ? "text-[#111111]" : "text-[#1f2937]"}`}>
          {path.selectLabel}
        </p>
      </div>
    </div>
  );
}

function InvestmentPath({
  profile,
  initialAmount = "",
  initialPath = null,
  onBack,
  onSuccess,
  onDotClick,
  stepLabels,
}) {
  const [path, setPath] = useState(initialPath);
  const [amounts, setAmounts] = useState({
    direct: initialPath === "direct" ? initialAmount : "",
    "third-party": initialPath === "third-party" ? initialAmount : "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleAmountChange = (id) => (event) => {
    const raw = event.target.value.replace(/[^\d]/g, "");
    const next = raw ? Number(raw).toLocaleString("en-US") : "";
    setAmounts((curr) => ({ ...curr, [id]: next }));

    // Real-time validation against the path minimum
    const pathDef = PATHS.find((p) => p.id === id);
    const parsed = parseAmount(next);
    setErrors((curr) => {
      const updated = { ...curr };
      delete updated.path;
      if (next && parsed > 0 && parsed < pathDef.minimum) {
        updated[id] = `Minimum investment is ${formatCurrency(pathDef.minimum)}`;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  // The currently-selected path's amount is valid (and present) — used to gate Continue
  const selectedPath = PATHS.find((p) => p.id === path);
  const parsedAmount = selectedPath ? parseAmount(amounts[selectedPath.id]) : 0;
  const amountValid = !!selectedPath && parsedAmount >= selectedPath.minimum;

  const handleContinue = async () => {
    setApiError("");
    if (!path) {
      setErrors({ path: "Select an investment path to continue." });
      return;
    }
    const selected = PATHS.find((p) => p.id === path);
    const parsed = parseAmount(amounts[path]);
    if (parsed < selected.minimum) {
      setErrors({ [path]: `Minimum investment is ${formatCurrency(selected.minimum)}` });
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerInvestor({
        profile,
        experience: "experienced",
        investmentAmount: parsed,
        accreditationStatus: selected.accreditationStatus,
        password: profile.password,
        passwordConfirmation: profile.passwordConfirmation,
      });
      onSuccess({
        investmentAmount: parsed,
        investmentPath: path,
        investorCode: data?.investor?.code || data?.code || "",
        registrationResponse: data,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})?.[0]?.[0] ||
        "We couldn't create your account. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      dots={6}
      activeDot={4}
      stepLabel="STEP 5 OF 6"
      onDotClick={onDotClick}
      stepLabels={stepLabels}
    >
      {/* Center the content with a comfortable max-width so the right side
          doesn't read as empty whitespace */}
      <div className="mx-auto max-w-[820px]">
        {/* Header */}
        <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
          Investment Path
        </p>
        <h1 className="font-display mt-2 text-[40px] leading-[1.05] text-[#111111] xl:text-[52px]">
          How would you like to invest?
        </h1>

        {/* Path cards — stacked vertically */}
        <div className="mt-6 space-y-4">
          {PATHS.map((p) => (
            <PathCard
              key={p.id}
              path={p}
              selected={path === p.id}
              amount={amounts[p.id]}
              onAmountChange={handleAmountChange(p.id)}
              onSelect={() => {
                setPath(p.id);
                setErrors({});
              }}
              error={errors[p.id]}
            />
          ))}
        </div>

        {/* Path-not-selected error */}
        {errors.path ? (
          <p className="mt-2 text-[12px] text-red-600">{errors.path}</p>
        ) : null}

        {/* Bottom note */}
        <div className="mt-4 flex items-start gap-2.5 text-[12px] text-[#4b5563]">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f2f1ee]">
            <Info className="h-3 w-3 text-[#6b7280]" />
          </span>
          <p className="leading-5">
            Final investor eligibility and investment access are determined through the
            investor qualification process and applicable offering requirements.
          </p>
        </div>

        {/* API error */}
        {apiError ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-[12px] leading-5 text-red-700">{apiError}</p>
          </div>
        ) : null}

        {/* Buttons — Back to LEFT of Continue, grouped on the right */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            aria-label="Back"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-black/15 bg-white px-6 text-[15px] font-medium text-[#111111] transition hover:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting || !amountValid}
            aria-label="Continue"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-7 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}

export default InvestmentPath;
