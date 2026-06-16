import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Welcome from "./onboarding/steps/Welcome";
import HowItWorks from "./onboarding/steps/HowItWorks";
import Profile from "./onboarding/steps/Profile";
import CurrentOffering from "./onboarding/steps/CurrentOffering";
import InvestmentPath from "./onboarding/steps/InvestmentPath";
import Complete from "./onboarding/steps/Complete";

/**
 * New 6-step onboarding flow. Slim orchestrator that holds shared form state
 * and routes between step components.
 *
 * Step order: welcome → how-it-works → profile → current-offering →
 *             investment-path → complete
 *
 * Each step renders inside its own <OnboardingShell> (or a custom layout
 * for the photo-bleed Profile step).
 */
const STEPS = [
  "welcome",
  "how-it-works",
  "profile",
  "current-offering",
  "investment-path",
  "complete",
];

const PROFILE_INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  mobilePhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  zipPostalCode: "",
  country: "United States",
  password: "",
  passwordConfirmation: "",
  receiveUpdates: false,
  acceptTerms: false,
  acceptPrivacy: false,
};

function Placeholder({ step, goTo, navigate }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8f8f6] p-10 text-center">
      <div className="max-w-md">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
          Onboarding — Step {STEPS.indexOf(step) + 1} of 6
        </p>
        <h1 className="font-display mt-3 text-[36px] text-[#111111]">
          {step.replace(/-/g, " ")}
        </h1>
        <p className="mt-3 text-sm text-[#4b5563]">
          This step is being built. Use the buttons below to navigate.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => goTo("welcome")}
            className="h-10 rounded-[10px] border border-black/15 bg-white px-4 text-sm font-medium text-[#111111]"
          >
            ← Start over
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="h-10 rounded-[10px] bg-[#111111] px-4 text-sm font-medium text-white"
          >
            Skip to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("welcome");

  // Shared state across the flow — collected progressively across steps.
  const [profile, setProfile] = useState(PROFILE_INITIAL);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentPath, setInvestmentPath] = useState("direct");
  // eslint-disable-next-line no-unused-vars
  const [investorCode, setInvestorCode] = useState("");

  const goTo = (next) => setStep(next);

  switch (step) {
    case "welcome":
      return <Welcome onBegin={() => goTo("how-it-works")} />;

    case "how-it-works":
      return (
        <HowItWorks
          onBack={() => goTo("welcome")}
          onNext={() => goTo("profile")}
        />
      );

    case "profile":
      return (
        <Profile
          initial={profile}
          onBack={() => goTo("how-it-works")}
          onNext={(submitted) => {
            setProfile(submitted);
            goTo("current-offering");
          }}
        />
      );

    case "current-offering":
      return (
        <CurrentOffering
          onBack={() => goTo("profile")}
          onNext={() => goTo("investment-path")}
        />
      );

    case "investment-path":
      return (
        <InvestmentPath
          profile={profile}
          initialAmount={investmentAmount}
          initialPath={investmentPath}
          onBack={() => goTo("current-offering")}
          onSuccess={({ investmentAmount: amt, investmentPath: p, investorCode: code }) => {
            setInvestmentAmount(amt);
            setInvestmentPath(p);
            setInvestorCode(code);
            goTo("complete");
          }}
        />
      );

    case "complete":
      return (
        <Complete
          onBack={() => goTo("investment-path")}
          onContinueToPortal={() => navigate("/dashboard")}
        />
      );

    default:
      return <Placeholder step={step} goTo={goTo} navigate={navigate} />;
  }
}

export default Onboarding;
