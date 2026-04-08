import { useMemo, useState } from "react";
import logo from "../assets/Logo.png";

const advisorPortrait = "/assets/Access_Icon.jpg";
const investmentRanges = ["$10K – $25K", "$25K – $50K", "$50K+"];
const timelineOptions = ["1–2 Years", "3–5 Years", "6+ Years", "Not Sure Yet"];
const accreditationOptions = ["Yes, I am accredited", "No, not yet"];

function ArrowIcon({ direction = "right" }) {
  const rotate = direction === "left" ? "rotate(180 8 8)" : undefined;

  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
      <g transform={rotate}>
        <path
          d="M4.75 8H11.25"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8.75 5.5L11.25 8L8.75 10.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function OnboardingHeader({ step }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <img
            src={logo}
            alt="Access Properties"
            className="h-[22px] w-auto object-contain opacity-95 sm:h-[19px]"
          />
          <span className="whitespace-nowrap text-[12px] font-medium tracking-[0.01em] text-[#1f2937] sm:text-[11.5px]">
            Access Properties
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#d1d5db] sm:gap-2.5">
          <span className="h-px w-7 bg-current/55 sm:w-10" />
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-[7px] w-[7px] rounded-full transition ${
                item === step ? "bg-black" : "bg-current"
              }`}
            />
          ))}
          <span className="h-px w-7 bg-current/55 sm:w-10" />
        </div>
      </div>
    </header>
  );
}

function OptionButton({
  label,
  isSelected,
  onClick,
  id,
  variant = "stacked",
  className = "",
  style,
}) {
  const variants = {
    compact: "h-[42px] rounded-[10px] px-4 text-[12.5px] font-medium",
    grid: "h-[60px] rounded-[16px] px-5 text-[15px] font-medium",
    mobile: "h-[58px] rounded-[16px] px-5 text-[15px] font-medium",
    stacked: "h-[60px] rounded-[16px] px-5 text-[15px] font-medium",
  };

  return (
    <button
      id={id}
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      style={style}
      className={`w-full border text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.99] ${
        variants[variant]
      } ${
        isSelected
          ? "border-black bg-black text-white shadow-[0_14px_26px_rgba(17,24,39,0.18)]"
          : "border-black/10 bg-white text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.06)] hover:-translate-y-[2px] hover:border-black/40"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function LifestylePanel({ mobile = false, className = "" }) {
  return (
    <div
      className={`ambient-float relative overflow-hidden border border-black/10 bg-[linear-gradient(135deg,#f3f4f6_0%,#ffffff_52%,#e5e7eb_100%)] ${
        mobile
          ? "min-h-[172px] rounded-[24px]"
          : "min-h-[320px] rounded-[30px] lg:min-h-[640px]"
      } ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(17,24,39,0.08),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(17,24,39,0.06),transparent_38%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(17,24,39,0.08)_0.8px,transparent_0.8px)] [background-size:3px_3px]" />
      <div className="absolute inset-y-0 right-[44%] w-[28%] bg-[linear-gradient(180deg,rgba(17,24,39,0.06),rgba(17,24,39,0.02))]" />
      <div className="absolute inset-y-0 right-0 w-[44%] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(209,213,219,0.16))]" />
      <div className="absolute inset-y-0 right-[16%] w-px bg-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.12)_18%,rgba(243,244,246,0.92)_100%)]" />
      <div className="absolute inset-x-[-18%] bottom-[-28%] h-[64%] rounded-full border border-white/88" />
      <div className="absolute inset-x-[-6%] bottom-[-18%] h-[54%] rounded-full border border-white/72" />
      <div className="absolute inset-x-[6%] bottom-[-9%] h-[44%] rounded-full border border-white/52" />
      <div className="absolute bottom-[14%] left-[-6%] h-px w-[82%] rotate-[22deg] bg-white/74" />
      <div className="absolute bottom-[20%] left-[4%] h-px w-[72%] rotate-[22deg] bg-white/60" />
      <div className="absolute bottom-[26%] left-[12%] h-px w-[58%] rotate-[22deg] bg-white/44" />
    </div>
  );
}

function AdvisorCard({
  investmentRange,
  onChoose,
  onContinue,
  showError,
  mobile = false,
  className = "",
}) {
  return (
    <div
      className={`w-full border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_100%)] p-0 backdrop-blur-[10px] ${
        mobile
          ? "rounded-[20px] shadow-[0_18px_34px_rgba(17,24,39,0.08)]"
          : "rounded-[24px] shadow-[0_30px_64px_rgba(17,24,39,0.12)]"
      } ${className}`}
    >
      <div
        className={`flex items-center gap-3 border-b border-black/10 ${
          mobile ? "px-4 py-3" : "px-5 py-3"
        }`}
      >
        <img
          src={advisorPortrait}
          alt="Your Access Advisor"
          className={`rounded-full object-cover shadow-[0_8px_14px_rgba(17,24,39,0.12)] ${
            mobile ? "h-[40px] w-[40px]" : "h-[42px] w-[42px]"
          }`}
        />
        <p className="whitespace-nowrap text-[12.5px] font-medium text-[#374151]">
          Your Access Advisor
        </p>
      </div>

      <div className={mobile ? "px-4 py-4" : "px-5 py-5"}>
        <p
          className={`font-display leading-none text-[#111111] ${
            mobile ? "text-[21px]" : "text-[22px]"
          }`}
        >
          Welcome.
        </p>
        <p className="mt-3 text-[13px] leading-[1.9] text-[#4b5563]">
          Let&apos;s find the right investment path for you.
        </p>
        <div className="mt-4 h-px bg-black/10" />
        <p className="mt-4 text-[13px] leading-[1.85] text-[#374151]">
          What range are you thinking of investing?
        </p>

        <div className="mt-4 space-y-2">
          {investmentRanges.map((option, index) => (
            <OptionButton
              key={option}
              id={`option-range-${option}`}
              label={option}
              variant="compact"
              className="step-one-option"
              isSelected={investmentRange === option}
              onClick={() => onChoose(option)}
              style={{ animationDelay: `${180 + index * 70}ms` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className={`mt-4 flex w-full items-center justify-center gap-2 bg-black font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:-translate-y-[1px] hover:bg-[#1f2937] active:scale-[0.99] ${
            mobile
              ? "h-[44px] rounded-[12px] text-[14px]"
              : "h-[42px] rounded-[10px] text-[13.5px]"
          }`}
        >
          Continue
          <ArrowIcon />
        </button>

        {showError && (
          <p className="mt-3 text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
            Please select an option to continue.
          </p>
        )}
      </div>
    </div>
  );
}

function StepIntroList() {
  const items = [
    "Institutional-Grade Opportunities",
    "Low Minimums to Start",
    "Expert Guidance Along the Way",
  ];

  return (
    <ul className="mt-12 max-w-[282px] text-[13px] leading-[1.62] text-[#4b5563]">
      {items.map((item, index) => (
        <li
          key={item}
          className={`flex gap-3 py-4 ${
            index !== items.length - 1 ? "border-b border-black/10" : ""
          } ${index === 0 ? "pt-0" : ""} ${index === items.length - 1 ? "pb-0" : ""}`}
        >
          <span className="mt-[9px] h-[4px] w-[4px] rounded-full bg-black" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AnimatedStepWrapper({ direction, children, className = "" }) {
  return (
    <div
      className={`wizard-step ${
        direction >= 0 ? "wizard-step-forward" : "wizard-step-back"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function MobileStepSection({ children, className = "" }) {
  return (
    <section className={`px-4 py-8 ${className}`}>
      <div className="mx-auto w-full max-w-[420px]">{children}</div>
    </section>
  );
}

function MobileNavigation({
  step,
  onBack,
  onNext,
  nextLabel,
  showValidationError,
}) {
  return (
    <div className="sticky bottom-0 border-t border-black/10 bg-white/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-[10px]">
      {showValidationError && (
        <p className="mb-3 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
          Please select an option to continue.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white px-4 text-[17px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:border-black/40 active:scale-[0.99]"
          >
            <ArrowIcon direction="left" />
            Back
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-black px-5 text-[18px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99]"
        >
          {nextLabel}
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function NavigationButtons({ onBack, onNext, nextLabel }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white px-5 text-[15px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-[1px] hover:border-black/40 active:scale-[0.99] sm:w-auto"
      >
        <ArrowIcon direction="left" />
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-black px-6 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:-translate-y-[1px] hover:bg-[#1f2937] active:scale-[0.99] sm:w-auto"
      >
        {nextLabel}
        <ArrowIcon />
      </button>
    </div>
  );
}

function StepOneLayout({
  investmentRange,
  onChoose,
  onContinue,
  showError,
  mobile = false,
}) {
  if (mobile) {
    return (
      <MobileStepSection>
        <div className="mx-auto max-w-[360px] text-center step-one-fade-in">
          <h1 className="font-display text-[38px] leading-[0.98] text-[#111111]">
            Invest with
            <br />
            Access Properties
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#4b5563]">
            Institutional-grade opportunities with expert guidance along the way.
          </p>
        </div>

        <div className="mt-7">
          <LifestylePanel mobile />
        </div>

        <div className="-mt-10 relative z-10">
          <AdvisorCard
            investmentRange={investmentRange}
            onChoose={onChoose}
            onContinue={onContinue}
            showError={showError}
            mobile
            className="step-one-fade-in-delayed"
          />
        </div>
      </MobileStepSection>
    );
  }

  return (
    <section className="relative h-[calc(100dvh-76px)] overflow-x-hidden px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(243,244,246,0.32)_28%,rgba(229,231,235,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-44%] h-[82%] rounded-full border border-white/92" />
      <div className="pointer-events-none absolute inset-x-[-2%] bottom-[-38%] h-[68%] rounded-full border border-white/74" />
      <div className="pointer-events-none absolute inset-x-[4%] bottom-[-28%] h-[56%] rounded-full border border-white/56" />
      <div className="pointer-events-none absolute bottom-[14%] left-[50%] h-px w-[34%] rotate-[22deg] bg-white/56" />
      <div className="pointer-events-none absolute bottom-[20%] left-[56%] h-px w-[28%] rotate-[22deg] bg-white/42" />
      <div className="pointer-events-none absolute bottom-[26%] left-[61%] h-px w-[21%] rotate-[22deg] bg-white/30" />
      <div className="pointer-events-none absolute left-[10%] top-[18%] h-56 w-56 rounded-full bg-black/6 blur-3xl" />
      <div className="pointer-events-none absolute right-[18%] top-[12%] h-72 w-72 rounded-full bg-black/8 blur-3xl" />

      <div className="relative flex h-full w-full items-center">
        <div className="grid h-full w-full grid-cols-1 gap-10 lg:grid-cols-[0.48fr_0.52fr] lg:items-center lg:gap-6">
          <div className="relative flex items-center justify-center lg:justify-start">
            <div className="step-one-fade-in w-full max-w-[560px] lg:pl-[6vw] xl:pl-[9vw]">
              <div className="max-w-[380px]">
                <h1 className="font-display text-[44px] leading-[0.96] text-[#111111] xl:text-[58px]">
                  Invest with
                  <br />
                  Access Properties
                </h1>
                <div className="mt-8 h-px w-[176px] bg-black/10" />
              </div>

              <StepIntroList />
            </div>
          </div>

          <div className="relative flex h-[68vh] min-h-[560px] max-h-[720px] items-stretch justify-end self-center">
            <LifestylePanel className="h-full w-full rounded-l-[40px] rounded-r-none border-r-0 shadow-[0_24px_44px_rgba(118,108,95,0.08)]" />
          </div>
        </div>

        <div className="step-one-fade-in-delayed absolute right-[12%] top-[40%] z-20 hidden w-full max-w-[320px] -translate-y-1/2 lg:block xl:right-[14%] xl:max-w-[344px]">
          <AdvisorCard
            investmentRange={investmentRange}
            onChoose={onChoose}
            onContinue={onContinue}
            showError={showError}
          />
        </div>
      </div>
    </section>
  );
}

function MobileQuestionStep({
  title,
  subtitle,
  prompt,
  options,
  selectedValue,
  onChoose,
  idPrefix,
  showDetailsLink = false,
}) {
  return (
    <MobileStepSection className="pb-6">
      <div className="mx-auto max-w-[360px] text-center">
        <h1 className="font-display text-[36px] leading-[1.02] text-[#111111]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">{subtitle}</p>
        )}
        <div className="mt-6 h-px w-full bg-black/10" />
        <p className="mt-6 text-[19px] leading-8 text-[#1f2937]">{prompt}</p>
      </div>

      <div className="mt-8 space-y-3">
        {options.map((option) => (
          <OptionButton
            key={option}
            id={`${idPrefix}-${option}`}
            label={option}
            variant="mobile"
            isSelected={selectedValue === option}
            onClick={() => onChoose(option)}
          />
        ))}
      </div>

      {showDetailsLink && (
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-[15px] font-medium text-[#111111] underline decoration-black/30 underline-offset-[5px] transition hover:text-[#374151]"
          >
            View accreditation details
          </button>
        </div>
      )}
    </MobileStepSection>
  );
}

function DesktopQuestionLayout({
  title,
  subtitle,
  prompt,
  options,
  selectedValue,
  onChoose,
  idPrefix,
  optionVariant,
  showDetailsLink = false,
  onBack,
  onNext,
  nextLabel,
  showValidationError,
}) {
  return (
    <section className="flex min-h-[calc(100dvh-76px)] items-center px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="mx-auto max-w-[680px] text-center">
          <h1 className="font-display text-[46px] leading-[1.02] text-[#111111] xl:text-[56px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">{subtitle}</p>
          )}
          <div className="mt-8 h-px w-full bg-black/10" />
          <p className="mt-8 text-[20px] leading-8 text-[#1f2937]">{prompt}</p>
        </div>

        <div
          className={`mx-auto mt-10 ${
            optionVariant === "grid"
              ? "grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2"
              : "max-w-[560px] space-y-4"
          }`}
        >
          {options.map((option) => (
            <OptionButton
              key={option}
              id={`${idPrefix}-${option}`}
              label={option}
              variant={optionVariant}
              isSelected={selectedValue === option}
              onClick={() => onChoose(option)}
            />
          ))}
        </div>

        {showDetailsLink && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-[14px] font-medium text-[#111111] underline decoration-black/30 underline-offset-[5px] transition hover:text-[#374151]"
            >
              View accreditation details
            </button>
          </div>
        )}

        <div className="mx-auto mt-14 border-t border-black/10 pt-6">
          {showValidationError && (
            <p className="mb-4 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
              Please select an option to continue.
            </p>
          )}
          <NavigationButtons
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
          />
        </div>
      </div>
    </section>
  );
}

function StepTwoLayout(props) {
  return (
    <DesktopQuestionLayout
      {...props}
      optionVariant="grid"
      options={timelineOptions}
      idPrefix="option-timeline"
    />
  );
}

function StepThreeLayout(props) {
  return (
    <DesktopQuestionLayout
      {...props}
      optionVariant="stacked"
      options={accreditationOptions}
      idPrefix="option-accredited"
      showDetailsLink
    />
  );
}

function SubmittedState({ mobile = false }) {
  return (
    <section
      className={`flex min-h-[calc(100dvh-76px)] items-center justify-center px-4 py-10 sm:px-8 lg:px-12 ${
        mobile ? "" : "text-center"
      }`}
    >
      <div
        className={`w-full border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_62%,#f3f4f6_100%)] shadow-[0_18px_32px_rgba(17,24,39,0.12)] ${
          mobile
            ? "max-w-[420px] rounded-[28px] px-6 py-10 text-center"
            : "max-w-[760px] rounded-[34px] px-10 py-14"
        }`}
      >
        <p className="font-display text-[40px] leading-none text-[#111111] sm:text-[54px]">
          Thank you
        </p>
        <p className="mt-4 text-[15px] leading-7 text-[#4b5563] sm:text-[16px]">
          Your onboarding selections have been collected. Check the console for
          the submission payload.
        </p>
      </div>
    </section>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [investmentRange, setInvestmentRange] = useState("");
  const [investmentTimeline, setInvestmentTimeline] = useState("");
  const [accreditedStatus, setAccreditedStatus] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const stepTitle = useMemo(() => {
    if (step === 1) return "Invest with Access Properties";
    if (step === 2) return "Let’s talk about your investment timeline.";
    return "Are you an accredited investor?";
  }, [step]);

  const stepPrompt = useMemo(() => {
    if (step === 1) return "Institutional-grade opportunities with expert guidance.";
    if (step === 2) return "How long do you plan to invest?";
    return "Do you meet the SEC’s accreditation criteria?";
  }, [step]);

  const selectedValue =
    step === 1
      ? investmentRange
      : step === 2
        ? investmentTimeline
        : accreditedStatus;

  const showValidationError = touched && !selectedValue;
  const activeViewKey = submitted ? "submitted" : `step-${step}`;

  const onNext = () => {
    setTouched(true);

    if (!selectedValue) return;

    setDirection(1);

    if (step === 3) {
      setSubmitted(true);
      console.log("Onboarding submission:", {
        investmentRange,
        investmentTimeline,
        accreditedStatus,
      });
      return;
    }

    setStep((prev) => prev + 1);
    setTouched(false);
  };

  const onBack = () => {
    if (step === 1) return;

    setDirection(-1);
    setStep((prev) => prev - 1);
    setTouched(false);
  };

  const onChoose = (option) => {
    if (step === 1) setInvestmentRange(option);
    if (step === 2) setInvestmentTimeline(option);
    if (step === 3) setAccreditedStatus(option);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(229,231,235,0.85),transparent_30%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
          <div className="absolute left-[-14%] top-[18%] h-80 w-80 rounded-full bg-black/5 blur-3xl" />
          <div className="absolute right-[-8%] top-[30%] h-96 w-96 rounded-full bg-black/6 blur-3xl" />
        </div>

        <div className="relative z-20">
          <OnboardingHeader step={submitted ? 3 : step} />
        </div>

        <main className="relative z-10 flex-1">
          <AnimatedStepWrapper key={activeViewKey} direction={direction} className="h-full">
            {submitted ? (
              <>
                <div className="sm:hidden">
                  <SubmittedState mobile />
                </div>
                <div className="hidden sm:block">
                  <SubmittedState />
                </div>
              </>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <div className="sm:hidden">
                      <StepOneLayout
                        mobile
                        investmentRange={investmentRange}
                        onChoose={onChoose}
                        onContinue={onNext}
                        showError={showValidationError}
                      />
                    </div>
                    <div className="hidden sm:block">
                      <StepOneLayout
                        investmentRange={investmentRange}
                        onChoose={onChoose}
                        onContinue={onNext}
                        showError={showValidationError}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="sm:hidden">
                      <div className="flex min-h-[calc(100dvh-76px)] flex-col">
                        <MobileQuestionStep
                          title={stepTitle}
                          prompt={stepPrompt}
                          options={timelineOptions}
                          selectedValue={investmentTimeline}
                          onChoose={onChoose}
                          idPrefix="mobile-option-timeline"
                        />
                        <div className="mt-auto">
                          <MobileNavigation
                            step={step}
                            onBack={onBack}
                            onNext={onNext}
                            nextLabel="Next"
                            showValidationError={showValidationError}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <StepTwoLayout
                        title={stepTitle}
                        prompt={stepPrompt}
                        selectedValue={investmentTimeline}
                        onChoose={onChoose}
                        onBack={onBack}
                        onNext={onNext}
                        nextLabel="Next"
                        showValidationError={showValidationError}
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="sm:hidden">
                      <div className="flex min-h-[calc(100dvh-76px)] flex-col">
                        <MobileQuestionStep
                          title={stepTitle}
                          subtitle="This helps us find the best opportunities for you."
                          prompt={stepPrompt}
                          options={accreditationOptions}
                          selectedValue={accreditedStatus}
                          onChoose={onChoose}
                          idPrefix="mobile-option-accredited"
                          showDetailsLink
                        />
                        <div className="mt-auto">
                          <MobileNavigation
                            step={step}
                            onBack={onBack}
                            onNext={onNext}
                            nextLabel="Continue"
                            showValidationError={showValidationError}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <StepThreeLayout
                        title={stepTitle}
                        subtitle="This helps us find the best opportunities for you."
                        prompt={stepPrompt}
                        selectedValue={accreditedStatus}
                        onChoose={onChoose}
                        onBack={onBack}
                        onNext={onNext}
                        nextLabel="Continue"
                        showValidationError={showValidationError}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </AnimatedStepWrapper>
        </main>
      </div>
    </div>
  );
}
