import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";
import { HERO_IMAGES } from "../../../styles/theme";

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "addressLine1",
  "city",
  "stateProvince",
  "zipPostalCode",
  "country",
  "password",
  "passwordConfirmation",
];

function validate(profile) {
  const errors = {};
  REQUIRED_FIELDS.forEach((key) => {
    if (!profile[key] || !String(profile[key]).trim()) {
      errors[key] = "Required";
    }
  });
  if (profile.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) {
    errors.email = "Enter a valid email";
  }
  if (profile.password && profile.password.length < 8) {
    errors.password = "8+ characters required";
  }
  if (
    profile.password &&
    profile.passwordConfirmation &&
    profile.password !== profile.passwordConfirmation
  ) {
    errors.passwordConfirmation = "Doesn't match";
  }
  if (!profile.acceptTerms) errors.acceptTerms = "Required";
  if (!profile.acceptPrivacy) errors.acceptPrivacy = "Required";
  return errors;
}

function Input({ name, value, onChange, error, type = "text", placeholder, autoComplete, rightSlot, ...rest }) {
  return (
    <div>
      <div
        className={`relative flex h-10 items-center rounded-[8px] border bg-white transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-black/5 ${
          error ? "border-red-300" : "border-black/10"
        }`}
      >
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full flex-1 bg-transparent px-3 text-[13px] text-[#111111] outline-none placeholder:text-[#9ca3af]"
          {...rest}
        />
        {rightSlot}
      </div>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
      {children}
    </p>
  );
}

function Select({ name, value, onChange, error, options, placeholder }) {
  return (
    <div>
      <div
        className={`relative flex h-10 items-center rounded-[8px] border bg-white transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-black/5 ${
          error ? "border-red-300" : "border-black/10"
        }`}
      >
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="h-full flex-1 appearance-none bg-transparent px-3 pr-9 text-[13px] text-[#111111] outline-none"
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#9ca3af]" />
      </div>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-black/8 pb-1.5">
      <h3 className="font-display text-[15px] leading-tight text-[#111111]">
        {title}
      </h3>
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
        {eyebrow}
      </span>
    </div>
  );
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC","PR",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Mexico",
  "South Africa",
  "Australia",
  "Other",
];

function Profile({ initial, onBack, onNext }) {
  const [profile, setProfile] = useState(initial);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProfile((curr) => ({
      ...curr,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((curr) => {
        const next = { ...curr };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = validate(profile);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const firstField = Object.keys(next)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      el?.focus();
      return;
    }
    onNext(profile);
  };

  return (
    <OnboardingShell
      dots={6}
      activeDot={2}
      stepLabel="STEP 3 OF 6"
      variant="bleed"
      showFootnotes={false}
    >
      <div className="grid h-full lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT — hero photo, fills the available height */}
        <aside className="relative hidden h-full lg:block">
          <img
            src={HERO_IMAGES.livingRoom}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/55" />

          {/* TOP — heading is the visual anchor */}
          <div className="absolute left-10 right-10 top-10 max-w-[460px] text-white sm:left-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/75">
              Profile
            </p>
            <h1 className="font-display mt-4 text-[36px] leading-[1.05] xl:text-[44px]">
              Create your
              <br />
              investor account.
            </h1>
            <p className="mt-4 max-w-[420px] text-[13px] leading-6 text-white/85">
              We use this information to personalize your dashboard, prepare
              qualification requirements, and prefill investment documents.
            </p>
          </div>

          {/* BOTTOM — small security note */}
          <div className="absolute bottom-8 left-10 right-10 max-w-[460px] sm:left-12">
            <div className="flex items-start gap-3 rounded-[10px] bg-white/10 px-3.5 py-2.5 text-white/90 backdrop-blur-sm">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="text-[11px] leading-5">
                Your information is protected with secure onboarding and
                identity verification.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT — internally scrolling form so the page itself never scrolls */}
        <section className="h-full overflow-y-auto bg-white">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[560px] px-6 py-7 sm:px-10 sm:py-8"
          >
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Your Details
              </p>
              <h2 className="font-display mt-1.5 text-[24px] leading-tight text-[#111111]">
                Create your account
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                Tell us a bit about yourself — you can update anytime.
              </p>
            </div>

            <div>
              <SectionHeader eyebrow="01" title="Personal" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>First name</FieldLabel>
                  <Input
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <FieldLabel>Last name</FieldLabel>
                  <Input
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    error={errors.lastName}
                  />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email}
                  />
                </div>
                <div>
                  <FieldLabel>Mobile phone</FieldLabel>
                  <Input
                    type="tel"
                    name="mobilePhone"
                    value={profile.mobilePhone}
                    onChange={handleChange}
                    placeholder="Optional"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Section: Address */}
            <div className="mt-5">
              <SectionHeader eyebrow="02" title="Address" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Address line 1</FieldLabel>
                  <Input
                    name="addressLine1"
                    value={profile.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address"
                    autoComplete="address-line1"
                    error={errors.addressLine1}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Address line 2</FieldLabel>
                  <Input
                    name="addressLine2"
                    value={profile.addressLine2}
                    onChange={handleChange}
                    placeholder="Apt, suite, unit (optional)"
                    autoComplete="address-line2"
                  />
                </div>
                <div>
                  <FieldLabel>City</FieldLabel>
                  <Input
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="City"
                    autoComplete="address-level2"
                    error={errors.city}
                  />
                </div>
                <div>
                  <FieldLabel>State / Province</FieldLabel>
                  <Select
                    name="stateProvince"
                    value={profile.stateProvince}
                    onChange={handleChange}
                    placeholder="Select state"
                    options={US_STATES}
                    error={errors.stateProvince}
                  />
                </div>
                <div>
                  <FieldLabel>ZIP / Postal code</FieldLabel>
                  <Input
                    name="zipPostalCode"
                    value={profile.zipPostalCode}
                    onChange={handleChange}
                    placeholder="ZIP code"
                    autoComplete="postal-code"
                    error={errors.zipPostalCode}
                  />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    name="country"
                    value={profile.country}
                    onChange={handleChange}
                    options={COUNTRIES}
                    error={errors.country}
                  />
                </div>
              </div>
            </div>

            {/* Section: Security */}
            <div className="mt-5">
              <SectionHeader eyebrow="03" title="Security" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={profile.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    error={errors.password}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="grid h-full w-11 place-items-center text-[#9ca3af] hover:text-[#111111]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Confirm password</FieldLabel>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    name="passwordConfirmation"
                    value={profile.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    error={errors.passwordConfirmation}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="grid h-full w-11 place-items-center text-[#9ca3af] hover:text-[#111111]"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-[#6b7280]">
                Use 8+ characters with a mix of letters, numbers, and symbols.
              </p>
            </div>

            {/* Consents */}
            <div className="mt-5 space-y-1.5 border-t border-black/8 pt-4">
              <label className="flex items-start gap-2 text-[12px] text-[#1f2937]">
                <input
                  type="checkbox"
                  name="receiveUpdates"
                  checked={!!profile.receiveUpdates}
                  onChange={handleChange}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#111111]"
                />
                <span>Receive updates and investment opportunities from Access Properties</span>
              </label>

              <label className="flex items-start gap-2 text-[12px] text-[#1f2937]">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={!!profile.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#111111]"
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="underline decoration-black/30 underline-offset-2">
                    Terms of Use
                  </a>
                </span>
              </label>
              {errors.acceptTerms ? (
                <p className="ml-6 text-[10px] text-red-600">{errors.acceptTerms}</p>
              ) : null}

              <label className="flex items-start gap-2 text-[12px] text-[#1f2937]">
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={!!profile.acceptPrivacy}
                  onChange={handleChange}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#111111]"
                />
                <span>
                  I acknowledge the{" "}
                  <a href="#" className="underline decoration-black/30 underline-offset-2">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.acceptPrivacy ? (
                <p className="ml-6 text-[10px] text-red-600">{errors.acceptPrivacy}</p>
              ) : null}
            </div>

            {/* Buttons */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/15 bg-white px-4 text-[13px] font-medium text-[#111111] hover:border-black/40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="submit"
                aria-label="Create account"
                className="group inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#111111] px-5 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.18)] hover:bg-[#1f2937]"
              >
                Create Account
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-[#6b7280]">
              Already have an account?{" "}
              <a href="/login" className="text-[#111111] underline decoration-black/30 underline-offset-2 hover:decoration-black">
                Sign in
              </a>
            </p>
          </form>
        </section>
      </div>
    </OnboardingShell>
  );
}

export default Profile;
