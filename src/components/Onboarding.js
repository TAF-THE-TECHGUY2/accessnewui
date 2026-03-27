import { Fragment, useMemo, useState } from "react";
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
    <header className="flex items-center justify-between border-b border-[#e6dacc] pb-5">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Access Properties"
          className="h-6.5 w-auto object-contain opacity-95"
        />
        <span className="text-[13.5px] font-medium tracking-[0.01em] text-[#4f4841]">
          Access Properties
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[#d7cdc1]">
        {[1, 2, 3].map((item, index) => (
          <Fragment key={item}>
            {index > 0 && <span className="h-px w-6 bg-current/65" />}
            <span
              className={`h-2 w-2 rounded-full transition ${
                item === step ? "bg-[#6f8c8a]" : "bg-current"
              }`}
            />
          </Fragment>
        ))}
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
}) {
  const variants = {
    compact: "h-9.5 rounded-[10px] px-4 text-[12.5px] font-medium",
    grid: "h-[54px] rounded-[12px] px-4 text-[15px] font-medium",
    stacked: "h-[54px] rounded-[12px] px-5 text-[15px] font-medium",
  };

  return (
    <button
      id={id}
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`w-full border text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#90adaa]/35 ${
        variants[variant]
      } ${
        isSelected
          ? "border-[#7d9a98] bg-[#eef4f4] text-[#3f4f4e] shadow-[0_10px_20px_rgba(111,140,138,0.14)]"
          : "border-[#e5dacd] bg-white text-[#514941] shadow-[0_10px_22px_rgba(76,64,53,0.05)] hover:-translate-y-[1px] hover:border-[#d5c8b9]"
      }`}
    >
      {label}
    </button>
  );
}

function LifestylePanel() {
  return (
    <div className="relative min-h-[250px] overflow-hidden rounded-[24px] border border-[#e6ddd1] bg-[linear-gradient(160deg,#d9dfdb_0%,#ced5cf_26%,#e7ddd0_72%,#efe7dc_100%)] sm:min-h-[390px] sm:rounded-none sm:border-0 sm:border-l sm:border-[#e7ddd1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(255,255,255,0.82),transparent_34%)]" />
      <div className="absolute inset-y-0 right-0 w-[70%] bg-[linear-gradient(180deg,rgba(248,250,249,0.32),rgba(255,255,255,0.04))]" />
      <div className="absolute inset-y-0 right-[44%] w-[34%] bg-[linear-gradient(180deg,rgba(186,202,197,0.3),rgba(214,220,214,0.05))]" />
      <div className="absolute inset-y-0 right-[44%] w-px bg-[#f8f3ec]/75" />
      <div className="absolute inset-y-0 right-[16%] w-px bg-[#f8f3ec]/72" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(244,237,228,0.06),rgba(232,220,203,0.95))]" />
      <div className="absolute -left-20 bottom-[-74px] h-80 w-80 rounded-full border border-[#f8f2ea]/82" />
      <div className="absolute -left-6 bottom-[-44px] h-64 w-64 rounded-full border border-[#f8f2ea]/72" />
      <div className="absolute left-[15%] top-[16%] h-24 w-24 rounded-full bg-white/16 blur-xl" />
      <div className="absolute right-[18%] top-[23%] h-32 w-32 rounded-full bg-[#f6f3ed]/26 blur-2xl" />
      <div className="absolute bottom-[10%] left-[56%] h-px w-[42%] rotate-[38deg] bg-[#f6efe6]/65" />
      <div className="absolute bottom-[17%] left-[58%] h-px w-[34%] rotate-[38deg] bg-[#f6efe6]/55" />
      <div className="absolute bottom-[24%] left-[61%] h-px w-[26%] rotate-[38deg] bg-[#f6efe6]/48" />
    </div>
  );
}

function AdvisorCard({ investmentRange, onChoose, onContinue, showError }) {
  return (
    <div className="w-full rounded-[20px] border border-[#e7ddd1] bg-[linear-gradient(180deg,#ffffff_0%,#fcf8f2_100%)] p-0 shadow-[0_22px_44px_rgba(106,90,69,0.1)]">
      <div className="flex items-center gap-3 border-b border-[#eee4d8] px-4 py-2.5">
        <img
          src={advisorPortrait}
          alt="Your Access Advisor"
          className="h-8.5 w-8.5 rounded-full object-cover shadow-[0_6px_12px_rgba(89,75,60,0.16)]"
        />
        <div>
          <p className="text-[12.5px] font-medium text-[#5f584f]">
            Your Access Advisor
          </p>
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-[13px] leading-6 text-[#524a43]">
          Welcome.
          <br />
          Let&apos;s find the right investment path for you.
          <br />
          <br />
          To begin, what range are you thinking of investing?
        </p>

        <div className="mt-4 space-y-2.5">
          {investmentRanges.map((option) => (
            <OptionButton
              key={option}
              id={`option-range-${option}`}
              label={option}
              variant="compact"
              isSelected={investmentRange === option}
              onClick={() => onChoose(option)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-4 flex h-10.5 w-full items-center justify-center gap-2 rounded-[10px] bg-[#6f8c8a] text-[13.5px] font-medium text-white shadow-[0_12px_22px_rgba(111,140,138,0.2)] transition hover:bg-[#607c79]"
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
  return (
    <ul className="mt-7 max-w-[206px] space-y-4.5 text-[12.5px] leading-[1.95] text-[#80776d]">
      {[
        "Institutional-Grade Opportunities",
        "Low Minimums to Start",
        "Expert Guidance Along the Way",
      ].map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-1 w-1 rounded-full bg-[#ccbda8]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StepOneLayout({ investmentRange, onChoose, onContinue, showError }) {
  return (
    <section className="pt-7">
      <div className="relative">
        <div className="overflow-hidden rounded-[28px] border border-[#e6dacc] bg-[linear-gradient(180deg,#fdfaf6_0%,#f6eee6_100%)]">
          <div className="grid gap-4 p-4 sm:min-h-[520px] sm:grid-cols-[1.28fr_0.72fr] sm:gap-0 sm:p-0">
            <div className="flex flex-col justify-between px-5 py-6 sm:px-8 sm:py-10">
              <div>
                <h1 className="font-display max-w-[208px] text-[40px] leading-[0.95] text-[#433b34] sm:text-[45px]">
                  Invest with
                  <br />
                  Access Properties
                </h1>
                <div className="mt-6 h-px w-24 bg-[#e8ddd0]" />
                <StepIntroList />
              </div>
            </div>

            <LifestylePanel />
          </div>
        </div>

        <div className="mt-4 w-full sm:absolute sm:right-4 sm:top-[112px] sm:mt-0 sm:max-w-[220px]">
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

function StepFrame({ children, centered = true }) {
  return (
    <section className="pt-8">
      <div className="rounded-[28px] border border-[#e6dacc] bg-[linear-gradient(180deg,#fdfaf6_0%,#f8f1e9_100%)] px-5 py-8 sm:px-8 sm:py-9">
        <div className={centered ? "mx-auto max-w-[390px] text-center" : ""}>
          {children}
        </div>
      </div>
    </section>
  );
}

function NavigationButtons({ onBack, onNext, nextLabel }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex h-11 items-center gap-2 rounded-[12px] border border-[#ddd2c4] bg-white px-4 text-[14px] font-medium text-[#5b544b] shadow-[0_10px_22px_rgba(76,64,53,0.05)] transition hover:-translate-y-[1px] hover:border-[#d0c2b2]"
      >
        <ArrowIcon direction="left" />
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex h-11 items-center gap-2 rounded-[12px] bg-[#6f8c8a] px-5 text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(111,140,138,0.22)] transition hover:bg-[#607c79]"
      >
        {nextLabel}
        <ArrowIcon />
      </button>
    </div>
  );
}

function SubmittedState() {
  return (
    <div className="pt-8">
      <div className="rounded-[24px] border border-[#d9e4df] bg-[linear-gradient(180deg,#f7fcfb_0%,#edf6f3_100%)] px-6 py-8 text-center shadow-[0_16px_30px_rgba(111,140,138,0.12)]">
        <p className="font-display text-[34px] leading-none text-[#3d4b49]">
          Thank you
        </p>
        <p className="mt-3 text-[14px] leading-6 text-[#5d6968]">
          Your onboarding selections have been collected. Check the console for
          the submission payload.
        </p>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
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

  const onNext = () => {
    setTouched(true);

    if (!selectedValue) return;

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
    setStep((prev) => prev - 1);
    setTouched(false);
  };

  const onChoose = (option) => {
    if (step === 1) setInvestmentRange(option);
    if (step === 2) setInvestmentTimeline(option);
    if (step === 3) setAccreditedStatus(option);
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="onboarding-shell soft-editorial-surface rounded-[30px] border border-[#e7dccf] p-5 sm:p-7">
          <OnboardingHeader step={step} />

          {!submitted && (
            <>
              {step === 1 && (
                <StepOneLayout
                  investmentRange={investmentRange}
                  onChoose={onChoose}
                  onContinue={onNext}
                  showError={showValidationError}
                />
              )}

              {step === 2 && (
                <StepFrame>
                  <h1 className="font-display mx-auto max-w-[390px] text-[42px] leading-[1.02] text-[#3f3832] sm:text-[44px]">
                    {stepTitle}
                  </h1>
                  <div className="mx-auto mt-6 h-px w-full max-w-[420px] bg-[#e3d6c8]" />
                  <p className="mt-6 text-[18px] leading-7 text-[#534a42]">
                    {stepPrompt}
                  </p>

                  <div className="mx-auto mt-7 grid max-w-[450px] grid-cols-2 gap-4">
                    {timelineOptions.map((option) => (
                      <OptionButton
                        key={option}
                        id={`option-timeline-${option}`}
                        label={option}
                        variant="grid"
                        isSelected={investmentTimeline === option}
                        onClick={() => onChoose(option)}
                      />
                    ))}
                  </div>
                </StepFrame>
              )}

              {step === 3 && (
                <StepFrame>
                  <h1 className="font-display mx-auto max-w-[360px] text-[40px] leading-[1.03] text-[#3f3832] sm:text-[42px]">
                    {stepTitle}
                  </h1>
                  <p className="mt-3 text-[14px] leading-6 text-[#776f66]">
                    This helps us find the best opportunities for you.
                  </p>
                  <div className="mx-auto mt-6 h-px w-full max-w-[420px] bg-[#e3d6c8]" />
                  <p className="mt-6 text-[18px] leading-7 text-[#534a42]">
                    {stepPrompt}
                  </p>

                  <div className="mx-auto mt-7 max-w-[450px] space-y-3.5">
                    {accreditationOptions.map((option) => (
                      <OptionButton
                        key={option}
                        id={`option-accredited-${option}`}
                        label={option}
                        variant="stacked"
                        isSelected={accreditedStatus === option}
                        onClick={() => onChoose(option)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-5 text-[13px] font-medium text-[#6a8583] underline decoration-[#a9bdbb] underline-offset-[5px] transition hover:text-[#58706e]"
                  >
                    View accreditation details
                  </button>
                </StepFrame>
              )}

              {step !== 1 && (
                <div className="mt-8 border-t border-[#e5dacd] pt-5">
                  {showValidationError && (
                    <p className="mb-4 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
                      Please select an option to continue.
                    </p>
                  )}
                  <NavigationButtons
                    onBack={onBack}
                    onNext={onNext}
                    nextLabel={step === 3 ? "Continue" : "Next"}
                  />
                </div>
              )}
            </>
          )}

          {submitted && <SubmittedState />}
        </div>
      </div>
    </div>
  );
}
