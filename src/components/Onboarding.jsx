import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Welcome from "./onboarding/steps/Welcome";
import Profile from "./onboarding/steps/Profile";
import Complete from "./onboarding/steps/Complete";

/**
 * 3-page accredited investor onboarding flow. Slim orchestrator that holds
 * shared form state and routes between pages.
 *
 * Page order: welcome → profile → complete → investor portal
 *
 * The account is created on the Profile page ("Create Account"), so Complete
 * is a post-registration confirmation page with no back navigation.
 */
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

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("welcome");

  // Shared state across the flow.
  const [profile, setProfile] = useState(PROFILE_INITIAL);
  // eslint-disable-next-line no-unused-vars
  const [investorCode, setInvestorCode] = useState("");

  switch (step) {
    case "profile":
      return (
        <Profile
          initial={profile}
          onBack={() => setStep("welcome")}
          onSuccess={({ profile: submitted, investorCode: code }) => {
            setProfile(submitted);
            setInvestorCode(code);
            setStep("complete");
          }}
        />
      );

    case "complete":
      return <Complete onContinueToPortal={() => navigate("/dashboard")} />;

    case "welcome":
    default:
      return <Welcome onBegin={() => setStep("profile")} />;
  }
}

export default Onboarding;
