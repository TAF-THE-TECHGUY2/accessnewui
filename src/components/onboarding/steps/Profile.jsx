import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";
import { registerInvestor } from "../../../services/investorService";

// The single accredited pathway offered by this flow. Investment amount and
// accreditation are confirmed later inside the investor portal, so the
// registration call records the fund minimum as the starting commitment.
const ACCREDITED_PATHWAY = {
  experience: "experienced",
  investmentAmount: 10000,
  accreditationStatus: "accredited",
};

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

function Input({ icon: Icon, name, value, onChange, error, type = "text", placeholder, autoComplete, rightSlot, ...rest }) {
  return (
    <div>
      <div
        className={`relative flex h-11 items-center rounded-[10px] border bg-white transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-black/5 ${
          error ? "border-red-300" : "border-black/10"
        }`}
      >
        {Icon ? (
          <span className="grid h-full w-10 place-items-center text-[#9ca3af]">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full flex-1 bg-transparent pr-3 text-[13px] text-[#111111] outline-none placeholder:text-[#9ca3af]"
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
    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
      {children}
    </p>
  );
}

function Select({ icon: Icon, name, value, onChange, error, options, placeholder }) {
  return (
    <div>
      <div
        className={`relative flex h-11 items-center rounded-[10px] border bg-white transition focus-within:border-[#111111] focus-within:ring-2 focus-within:ring-black/5 ${
          error ? "border-red-300" : "border-black/10"
        }`}
      >
        {Icon ? (
          <span className="grid h-full w-10 place-items-center text-[#9ca3af]">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="h-full flex-1 appearance-none bg-transparent pr-9 text-[13px] text-[#111111] outline-none"
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#9ca3af]" />
      </div>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Mexico",
  "South Africa",
  "Australia",
  "Other",
];

function Profile({ initial, onBack, onSuccess }) {
  const [profile, setProfile] = useState(initial);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    const next = validate(profile);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const firstField = Object.keys(next)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      el?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerInvestor({
        profile,
        ...ACCREDITED_PATHWAY,
        password: profile.password,
        passwordConfirmation: profile.passwordConfirmation,
      });
      onSuccess({
        profile,
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
    <OnboardingShell variant="bleed" showFootnotes={false}>
      <div className="grid h-full lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT — hero photo with all text grouped in the lower-left */}
        <aside className="relative hidden h-full lg:block">
          <img
            src="/assets/image.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

          {/* All text grouped in the lower-left, matching the mockup */}
          <div className="absolute bottom-12 left-10 right-10 max-w-[420px] text-white sm:left-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
              Profile
            </p>
            <h1 className="font-display mt-3 text-[36px] leading-[1.05] xl:text-[40px]">
              Create Your
              <br />
              Accredited Investor
              <br />
              Account
            </h1>
            <p className="mt-4 max-w-[360px] text-[13px] leading-6 text-white/85">
              Create your account to access the offering documents and continue
              the accredited investor qualification process.
            </p>

            {/* Inline security note — no pill, just icon + text */}
            <div className="mt-6 flex items-start gap-3 text-white/80">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="max-w-[340px] text-[12px] leading-5">
                Access Properties uses secure onboarding and verification
                processes to help protect your information.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT — fields only, no main heading, no section headers */}
        <section className="h-full overflow-y-auto bg-white">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[640px] px-6 py-10 sm:px-12 sm:py-12"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>First name</FieldLabel>
                <Input
                  icon={User}
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
                  icon={User}
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
                  icon={Mail}
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  autoComplete="email"
                  error={errors.email}
                />
              </div>
              <div>
                <FieldLabel>Mobile phone</FieldLabel>
                <Input
                  icon={Phone}
                  type="tel"
                  name="mobilePhone"
                  value={profile.mobilePhone}
                  onChange={handleChange}
                  placeholder="Mobile phone (optional)"
                  autoComplete="tel"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Address line 1</FieldLabel>
                <Input
                  icon={MapPin}
                  name="addressLine1"
                  value={profile.addressLine1}
                  onChange={handleChange}
                  placeholder="Address line 1"
                  autoComplete="address-line1"
                  error={errors.addressLine1}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Address line 2</FieldLabel>
                <Input
                  icon={MapPin}
                  name="addressLine2"
                  value={profile.addressLine2}
                  onChange={handleChange}
                  placeholder="Address line 2 (optional)"
                  autoComplete="address-line2"
                />
              </div>
              <div>
                <FieldLabel>City</FieldLabel>
                <Input
                  icon={MapPin}
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
                <Input
                  icon={Globe}
                  name="stateProvince"
                  value={profile.stateProvince}
                  onChange={handleChange}
                  placeholder="State / Province"
                  autoComplete="address-level1"
                  error={errors.stateProvince}
                />
              </div>
              <div>
                <FieldLabel>ZIP / Postal code</FieldLabel>
                <Input
                  icon={MapPin}
                  name="zipPostalCode"
                  value={profile.zipPostalCode}
                  onChange={handleChange}
                  placeholder="ZIP / Postal code"
                  autoComplete="postal-code"
                  error={errors.zipPostalCode}
                />
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <Select
                  icon={Globe}
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  options={COUNTRIES}
                  error={errors.country}
                />
              </div>
              <div>
                <FieldLabel>Password</FieldLabel>
                <Input
                  icon={Lock}
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
                      className="grid h-full w-10 place-items-center text-[#9ca3af] hover:text-[#111111]"
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
                  icon={Lock}
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
                      className="grid h-full w-10 place-items-center text-[#9ca3af] hover:text-[#111111]"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>
            </div>

            <p className="mt-2 text-[11px] text-[#6b7280]">
              Use 8+ characters with a mix of letters, numbers, and symbols.
            </p>

            {/* Receive updates */}
            <label className="mt-5 flex items-center gap-2 text-[12px] text-[#1f2937]">
              <input
                type="checkbox"
                name="receiveUpdates"
                checked={!!profile.receiveUpdates}
                onChange={handleChange}
                className="h-3.5 w-3.5 accent-[#111111]"
              />
              Receive updates from Access Properties
            </label>

            {/* Terms + Privacy side-by-side */}
            <div className="mt-5 grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-2">
              <div>
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
                  <p className="ml-6 mt-1 text-[10px] text-red-600">{errors.acceptTerms}</p>
                ) : null}
              </div>
              <div>
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
                  <p className="ml-6 mt-1 text-[10px] text-red-600">{errors.acceptPrivacy}</p>
                ) : null}
              </div>
            </div>

            {/* API error */}
            {apiError ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-[12px] leading-5 text-red-700">{apiError}</p>
              </div>
            ) : null}

            {/* Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                aria-label="Back"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-white px-5 text-[13px] font-medium text-[#111111] hover:border-black/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                aria-label="Create account"
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-[#111111] px-6 text-[13px] font-medium text-white shadow-[0_10px_20px_rgba(17,24,39,0.18)] hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] text-[#6b7280]">
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
