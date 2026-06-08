import { useMemo, useState } from "react";
import logo from "../assets/Logo.png";
import { useTypingEffect } from "../hooks/useTypingEffect";
import { parseAmount, registerInvestor } from "../services/investorService";

const MIN_INVESTMENT = 10000;

const advisorPortrait = "/assets/Access_Icon.jpg";

const FLOW_STEPS = [
  "welcome-hero",
  "welcome-help",
  "welcome-overview",
  "welcome-duration",
  "faq",
  "profile",
  "experience",
  "amount",
  "overview",
  "fund-overview",
  "accreditation",
  "branch-message",
  "create-password",
  "next-steps",
  "consent",
  "final-confirmation",
];

const STEP_PHASE_MAP = {
  "welcome-hero": 1,
  "welcome-help": 1,
  "welcome-overview": 1,
  "welcome-duration": 1,
  faq: 1,
  profile: 2,
  experience: 3,
  amount: 3,
  overview: 3,
  "fund-overview": 3,
  accreditation: 4,
  "branch-message": 4,
  "create-password": 5,
  "next-steps": 5,
  consent: 5,
  "final-confirmation": 6,
};

const PHASE_LABELS = {
  1: "Welcome",
  2: "Profile",
  3: "Investment",
  4: "Eligibility",
  5: "Next Steps",
  6: "Complete",
};

const PROFILE_INITIAL_STATE = {
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
  receiveUpdates: false,
};

const EXPERIENCE_OPTIONS = [
  { label: "Yes, I have", value: "experienced" },
  { label: "No, I’m new", value: "new" },
];

const ACCREDITATION_OPTIONS = [
  { label: "Yes", value: "accredited" },
  { label: "No", value: "not-accredited" },
];

const HOW_IT_WORKS_BULLETS = [
  "You invest into a real estate fund",
  "Capital is pooled with other investors",
  "Investments follow a defined strategy",
  "You receive a percentage ownership interest",
];

const INTRO_FEATURES = [
  "Institutional-Grade Opportunities",
  "Low Minimums to Start",
  "Expert Guidance Along the Way",
];

const WELCOME_EMAIL_TEMPLATE = {
  subject: "Welcome to Access Properties",
  body: `From the Desk of Dionysios Kaskarelis, Founder and Chief Executive Manager

Dear {{firstName}},

Welcome to Access Properties — we’re truly thrilled to have you on board. I want to personally thank you for placing your trust in us and to welcome you as a new Member.

At Access Properties, Members are not just investors — they are long-term partners. Your participation makes you part of a growing community that shares a belief that real estate investing should be accessible, transparent, and built for the long term.

Access Properties was created to broaden access to professionally managed real estate investing through a fund-based model. Rather than investing deal-by-deal, Members invest into diversified real estate investment funds where capital is pooled, and each Member owns a proportional interest based on their investment amount. This structure is designed to support scale, diversification, and a more institutional approach to real estate investing — while still keeping the experience approachable and Member-first.

Your participation supports our current offering, Access Properties Real Estate Diversified Income Fund I, and contributes to building a diversified portfolio designed for long-term performance and stability.

At Access Properties, we place a strong emphasis on transparency and communication — your Investor Dashboard is where this comes to life, giving you direct access to performance updates, reporting, and key documents.

Thank you again for joining us and for your confidence in our mission. We’re excited to build the future of Access Properties together — and we’re honored to have you with us as a Member.

Best regards,

Dionysios Kaskarelis
Founder and Chief Executive Manager`,
};

const FUND_OVERVIEW_DATA = {
  name: "Access Properties Real Estate Diversified Income Fund I",
  badge: "Current Offering",
  strategy:
    "Diversified income-producing real estate — multifamily, commercial, and mixed-use assets targeting consistent cash flow and long-term appreciation.",
  holdPeriod: "5–7 years (target)",
  distributions: "Quarterly, subject to fund performance",
  minimumInvestment: "$10,000",
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
  "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const COUNTRIES = [
  "United States","Canada","United Kingdom","Australia","Germany","France",
  "Netherlands","Switzerland","Singapore","Japan","Israel","United Arab Emirates",
  "South Africa","New Zealand","Ireland","Sweden","Norway","Denmark","Belgium",
  "Austria","Spain","Italy","Portugal","Mexico","Brazil","Other",
];

const FAQ_CATEGORIES = [
  {
    label: "Platform & Overview",
    questions: [
      { q: "What is Access Properties?", a: "Access Properties is a professionally managed real estate investment platform built around diversified fund structures. Members invest through fund vehicles that pool capital across a curated portfolio of income-producing real estate assets, giving each Member proportional ownership and professional management." },
      { q: "Who can invest with Access Properties?", a: "Access Properties serves both accredited and non-accredited investors, though the investment pathway differs by eligibility. Accredited investors may invest directly through Access Properties. Non-accredited investors may invest through our equity crowdfunding partner, subject to applicable limits and requirements." },
      { q: "Who owns the properties?", a: "Properties are held through fund and property-level entities. Members own a proportional interest in the investment vehicle based on their contribution, not direct title to individual properties." },
      { q: "What legal structure does Access Properties use?", a: "Access Properties uses a fund-based real estate investment structure. Each fund pools Member capital and deploys it across a portfolio of assets according to a defined strategy. Members receive an ownership interest proportional to their investment." },
    ],
  },
  {
    label: "Investment Process",
    questions: [
      { q: "What is the minimum investment?", a: "The minimum investment for the current offering is $10,000. Specific minimums may vary by fund and investor pathway." },
      { q: "How are returns generated?", a: "Returns may come from rental income generated by the portfolio, operational performance of the assets, and appreciation over the fund's hold period. Distributions are funded from net operating income and, where applicable, disposition proceeds." },
      { q: "How often are distributions paid?", a: "Distributions are targeted on a quarterly basis, subject to fund performance, cash reserves, and operating conditions. Exact timing and amounts are not guaranteed." },
      { q: "What is the typical hold period?", a: "The current fund targets a 5 to 7 year hold period. This may vary based on market conditions and the fund's investment strategy." },
      { q: "How does Access Properties support a fund-family model?", a: "Access Properties is designed to support multiple funds over time under a consistent investor experience. Each fund follows a defined strategy and is managed through the same platform, giving Members a cohesive experience as the fund family grows." },
    ],
  },
  {
    label: "Eligibility & Access",
    questions: [
      { q: "Are investments guaranteed?", a: "No. All real estate investments involve risk, including the possible loss of principal. Past performance does not guarantee future results. Please review the offering documents carefully before investing." },
      { q: "Can I sell my investment?", a: "Liquidity is generally limited. The current fund does not offer a secondary market or redemption program. Members should expect their capital to remain invested for the duration of the fund's hold period." },
      { q: "Can non-U.S. investors participate?", a: "Some non-U.S. investors may be able to participate, subject to jurisdictional, banking, and compliance requirements. Eligibility will be assessed during the onboarding and verification process." },
      { q: "Do I need a U.S. bank account to invest?", a: "Funding requirements depend on your jurisdiction and the specific offering. U.S.-based funding is generally required. Please contact your Access Advisor for guidance specific to your situation." },
      { q: "Can I use a self-directed IRA or 401(k) to invest?", a: "Investing through a self-directed IRA or solo 401(k) may be possible if your custodian supports private fund investments. Please consult your retirement account custodian and a qualified tax advisor before proceeding." },
    ],
  },
  {
    label: "Property & Management",
    questions: [
      { q: "How does Access Properties select investments?", a: "Investments are evaluated using a defined underwriting process that considers cash flow, location, asset quality, and strategic fit within the fund's portfolio construction goals. All acquisitions are reviewed by the investment committee." },
      { q: "What investment strategies does Access Properties employ?", a: "The current fund focuses on diversified income-producing real estate, targeting assets that generate consistent cash flow. Strategies may include multifamily, commercial, and mixed-use properties aligned with the fund's income objectives." },
      { q: "Who manages the properties?", a: "Properties are managed through vetted professional operating and management partners, overseen by the Access Properties asset management team. Members receive performance updates through the Investor Dashboard." },
      { q: "How often will I receive updates on my investment?", a: "Members receive updates through the Investor Dashboard and scheduled communications, including quarterly performance reports and material notices. You will have access to your dashboard from the time your investment is activated." },
      { q: "What happens if a property needs major repairs?", a: "Major capital expenditures are managed through operating reserves maintained at the fund or property level. The asset management team oversees the repair and maintenance process with the goal of protecting and preserving property value." },
      { q: "How does Access Properties handle tenant issues?", a: "Tenant matters are handled through professional property management partners under guidelines set by the Access Properties asset management team. Member capital is not directly exposed to individual tenant decisions." },
      { q: "Can I visit the properties I've invested in?", a: "Investor site visits are handled on a case-by-case basis and are subject to operational, safety, and tenant privacy considerations. Please reach out to your Access Advisor if you are interested." },
    ],
  },
  {
    label: "Fees & Financials",
    questions: [
      { q: "What fees does Access Properties charge?", a: "Fees vary by offering and are fully disclosed in the relevant offering documents. Common fees in fund structures include management fees and, where applicable, performance fees. Review the offering materials for current fee details." },
      { q: "How is property valuation determined?", a: "Property valuations are informed by independent appraisals, operating data, market comparables, and asset-level performance metrics. Valuations are reviewed periodically and reported through the Investor Dashboard." },
      { q: "What risks should I be aware of?", a: "Real estate investments carry market, operational, liquidity, and execution risks. The value of your investment can decrease. There is no guarantee of distributions or return of principal. Please review the full risk disclosures in the offering documents before investing." },
    ],
  },
  {
    label: "Tax Considerations",
    questions: [
      { q: "What tax documents will I receive?", a: "Members typically receive a Schedule K-1 annually, reflecting their share of the fund's income, deductions, and credits. Specific tax documents depend on the offering structure. Consult a qualified tax advisor for guidance." },
      { q: "How is rental income taxed?", a: "Tax treatment of rental income depends on the fund structure, your investor classification, and your personal circumstances. Generally, your share of net income flows through the K-1. Consult a tax advisor for details specific to your situation." },
      { q: "What is depreciation and how does it benefit me?", a: "Depreciation allows the fund to offset a portion of taxable real estate income through paper deductions on property values over time. Your share of this depreciation may flow through your K-1 and reduce your taxable income, subject to applicable rules." },
      { q: "Can I deduct losses from my investment?", a: "The ability to deduct losses depends on your tax classification, passive activity rules, and your personal situation. Most real estate fund losses are passive and can only offset passive income. Consult a qualified tax advisor." },
      { q: "What happens tax-wise when a property is sold?", a: "A property sale may create taxable gain or loss at the fund level, which flows through to Members via the K-1. The nature and timing of these events depends on the fund structure and the sale terms." },
      { q: "Are distributions taxable?", a: "Distributions may or may not be taxable depending on whether they represent income, return of capital, or gain from a sale. Your K-1 will clarify the character of each distribution. Consult a tax advisor for personal guidance." },
      { q: "Do I need to file taxes in Massachusetts?", a: "If the fund generates income from Massachusetts-based properties, you may have a filing obligation in Massachusetts regardless of where you reside. Review your K-1 and consult a tax advisor familiar with state filing requirements." },
      { q: "Are there special tax considerations for non-U.S. investors?", a: "Yes. Non-U.S. investors may be subject to FIRPTA withholding, additional reporting requirements, and treaty-based considerations. We strongly recommend working with a tax advisor experienced in cross-border real estate investment." },
    ],
  },
  {
    label: "Disclosures",
    questions: [
      { q: "Full Disclosure", a: "All investments involve risk and are subject to the governing offering documents, platform policies, and applicable securities regulations. Access Properties does not provide tax, legal, or financial advice. Past performance is not indicative of future results. Please review all offering documents carefully before investing." },
    ],
  },
];

const FAQ_ALL_QUESTIONS = FAQ_CATEGORIES.flatMap((c) => c.questions);

// kept for legacy reference — no longer used directly
const FAQ_CONTENT = {
  "What is Access Properties?":
    "Access Properties is a professionally managed real estate investment platform built around diversified fund structures. TODO: replace with approved brand positioning copy.",
  "Who can invest with Access Properties?":
    "Eligibility depends on the specific offering and investor verification requirements. TODO: replace with compliance-approved investor eligibility language.",
  "Who owns the properties?":
    "Properties are typically held through fund and property-level entities, while Members own a proportional interest in the investment vehicle. TODO: confirm legal phrasing.",
  "What legal structure does Access Properties use?":
    "Access Properties uses a fund-based real estate investment structure designed to support scale, governance, and reporting. TODO: replace with finalized legal structure summary.",
  "Are investments guaranteed?":
    "No investment is guaranteed, and all real estate investments involve risk. TODO: replace with approved risk disclosure language.",
  "Can I sell my investment?":
    "Liquidity is generally limited and depends on the structure of the specific offering. TODO: replace with offering-specific liquidity language.",
  "How does Access Properties support a fund-family model?":
    "The platform is designed to support multiple curated fund offerings under a consistent investor experience. TODO: replace with final product explanation.",
  "Can non-U.S. investors participate?":
    "Some non-U.S. investors may be able to participate, subject to jurisdictional, banking, and compliance requirements. TODO: confirm final eligibility policy.",
  "Do I need a U.S. bank account to invest?":
    "Funding and distribution requirements may depend on the offering and your jurisdiction. TODO: replace with treasury-approved funding guidance.",
  "How does Access Properties select investments?":
    "Investments are evaluated using underwriting, strategy fit, and portfolio construction criteria. TODO: replace with approved investment committee summary.",
  "What investment strategies does Access Properties employ?":
    "Strategies may include income-focused, diversified, and long-term real estate approaches depending on the fund. TODO: confirm with investment team.",
  "Who manages the properties?":
    "Properties are managed through professional operating and management partners. TODO: replace with finalized operating model details.",
  "How often will I receive updates on my investment?":
    "Investors receive updates through the Investor Dashboard and scheduled communications. TODO: define exact reporting cadence.",
  "What happens if a property needs major repairs?":
    "Major repairs are handled through reserves, asset management oversight, and operating decisions at the fund or property level. TODO: replace with approved explanation.",
  "How does Access Properties handle tenant issues?":
    "Tenant matters are handled through professional management processes and property-level oversight. TODO: replace with operating details.",
  "Can I visit the properties I’ve invested in?":
    "Investor visits may be limited and handled case by case based on safety, operations, and tenant privacy. TODO: confirm final policy.",
  "What tax documents will I receive?":
    "Tax reporting depends on the offering structure and your investor status. TODO: replace with finalized tax document summary.",
  "How is rental income taxed?":
    "Tax treatment varies by structure, jurisdiction, and investor circumstances. TODO: replace with tax-approved summary language.",
  "What is depreciation and how does it benefit me?":
    "Depreciation can offset portions of taxable real estate income depending on structure and individual circumstances. TODO: confirm with tax counsel.",
  "Can I deduct losses from my investment?":
    "Loss deductions depend on tax rules, structure, and your personal situation. TODO: replace with compliance-approved language.",
  "What happens tax-wise when a property is sold?":
    "A sale may create taxable gains, losses, or other tax events depending on the fund structure. TODO: add finalized explanation.",
  "Are distributions taxable?":
    "Distributions may be taxable depending on their character and your tax situation. TODO: replace with approved tax guidance summary.",
  "Do I need to file taxes in Massachusetts?":
    "State filing obligations depend on where income is sourced and your personal circumstances. TODO: confirm with final tax guidance.",
  "Can I use a self-directed IRA or 401(k) to invest?":
    "Retirement-account investing may be possible depending on custody and offering rules. TODO: replace with final retirement-investing guidance.",
  "Are there special tax considerations for non-U.S. investors?":
    "Yes, non-U.S. investors may have additional withholding, reporting, and structuring considerations. TODO: confirm with tax and compliance teams.",
  "What is the minimum investment?":
    "Minimum investment size depends on the specific offering and investor pathway. TODO: replace with current offering minimums.",
  "How are returns generated?":
    "Returns may come from rental income, operational performance, and asset appreciation. TODO: replace with approved returns summary.",
  "How often are distributions paid?":
    "Distribution timing depends on the fund structure and performance profile. TODO: replace with finalized cadence.",
  "What fees does Access Properties charge?":
    "Fees vary by offering and are fully disclosed in the relevant documents. TODO: replace with approved fee summary.",
  "How is property valuation determined?":
    "Valuation is informed by underwriting, operating data, market comparables, and asset-level performance. TODO: confirm final valuation language.",
  "What is the typical hold period?":
    "Hold periods vary by strategy and offering, and are described in the investment materials. TODO: replace with current strategy guidance.",
  "What risks should I be aware of?":
    "Real estate investments involve market, operational, liquidity, and execution risks. TODO: replace with full risk summary.",
  "Full Disclosure":
    "All investments involve risk and are subject to the governing offering documents, platform policies, and applicable securities regulations. TODO: replace with full approved disclosure language.",
};

function fillWelcomeEmail(firstName) {
  return {
    subject: WELCOME_EMAIL_TEMPLATE.subject,
    body: WELCOME_EMAIL_TEMPLATE.body.replace(
      "{{firstName}}",
      firstName?.trim() || "Investor",
    ),
  };
}

function getStepPosition(stepId) {
  return FLOW_STEPS.indexOf(stepId);
}

function validateProfileContact(profile) {
  const errors = {};
  if (!profile.firstName.trim()) errors.firstName = "First name is required.";
  if (!profile.lastName.trim()) errors.lastName = "Last name is required.";
  if (!profile.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!profile.mobilePhone.trim()) {
    errors.mobilePhone = "Mobile phone is required.";
  } else if (!/^[\d\s\-+().]{7,20}$/.test(profile.mobilePhone.trim())) {
    errors.mobilePhone = "Enter a valid phone number.";
  }
  return errors;
}

function validateProfileAddress(profile) {
  const errors = {};
  if (!profile.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required.";
  if (!profile.city.trim()) errors.city = "City is required.";
  if (!profile.stateProvince.trim()) errors.stateProvince = "State or province is required.";
  if (!profile.zipPostalCode.trim()) errors.zipPostalCode = "Zip or postal code is required.";
  if (!profile.country.trim()) errors.country = "Country is required.";
  return errors;
}

function validateProfile(profile) {
  return {
    ...validateProfileContact(profile),
    ...validateProfileAddress(profile),
  };
}

function formatCurrencyInput(raw) {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return "$" + Number(digits).toLocaleString("en-US");
}

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector("[data-error='true']");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

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

function OnboardingHeader({ activePhase, totalPhases = 6 }) {
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

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-[#d1d5db] sm:gap-2.5">
            <span className="h-px w-7 bg-current/55 sm:w-10" />
            {Array.from({ length: totalPhases }).map((_, index) => (
              <span
                key={index}
                aria-current={index + 1 === activePhase ? "step" : undefined}
                className={`h-[7px] w-[7px] rounded-full transition ${
                  index + 1 === activePhase ? "bg-black" : "bg-current"
                }`}
              />
            ))}
            <span className="h-px w-7 bg-current/55 sm:w-10" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#9ca3af]">
            {PHASE_LABELS[activePhase]}
          </span>
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
    faq: "min-h-[64px] rounded-[16px] px-5 py-4 text-left text-[14px] font-medium leading-6",
  };

  return (
    <button
      id={id}
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      style={style}
      className={`w-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black/20 active:scale-[0.99] ${
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

function SecondaryButton({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white px-5 py-3 text-[14px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.05)] transition hover:-translate-y-[1px] hover:border-black/35 active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  className = "",
}) {
  return (
    <label className={`block ${className}`} data-error={Boolean(error)}>
      <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={`mt-2 h-[54px] w-full rounded-[16px] border bg-white px-4 text-[15px] text-[#111111] shadow-[0_10px_20px_rgba(17,24,39,0.04)] transition placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 ${
          error
            ? "border-[#ba645b] focus:ring-[#ba645b]/20"
            : "border-black/10 focus:border-black/35 focus:ring-black/10"
        }`}
      />
      {error && (
        <p className="mt-2 text-[12px] font-medium text-[#ba645b]" role="alert">{error}</p>
      )}
    </label>
  );
}

function SelectField({ label, name, value, onChange, error, options, className = "" }) {
  return (
    <label className={`block ${className}`} data-error={Boolean(error)}>
      <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </span>
      <div className="relative mt-2">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`h-[54px] w-full appearance-none rounded-[16px] border bg-white px-4 pr-10 text-[15px] text-[#111111] shadow-[0_10px_20px_rgba(17,24,39,0.04)] transition focus:outline-none focus:ring-2 ${
            error
              ? "border-[#ba645b] focus:ring-[#ba645b]/20"
              : "border-black/10 focus:border-black/35 focus:ring-black/10"
          } ${!value ? "text-[#9ca3af]" : ""}`}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-[#111111]">
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && (
        <p className="mt-2 text-[12px] font-medium text-[#ba645b]" role="alert">{error}</p>
      )}
    </label>
  );
}

function CheckboxField({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-4 shadow-[0_10px_22px_rgba(17,24,39,0.04)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-black/20 text-black focus:ring-black/10"
      />
      <span className="text-[14px] leading-6 text-[#374151]">{label}</span>
    </label>
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

function StepIntroList() {
  return (
    <ul className="mt-12 max-w-[282px] text-[13px] leading-[1.62] text-[#4b5563]">
      {INTRO_FEATURES.map((item, index) => (
        <li
          key={item}
          className={`flex gap-3 py-4 ${
            index !== INTRO_FEATURES.length - 1 ? "border-b border-black/10" : ""
          } ${index === 0 ? "pt-0" : ""} ${index === INTRO_FEATURES.length - 1 ? "pb-0" : ""}`}
        >
          <span className="mt-[9px] h-[4px] w-[4px] rounded-full bg-black" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AdvisorCard({ children, mobile = false, className = "" }) {
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

      <div className={mobile ? "px-4 py-4" : "px-5 py-5"}>{children}</div>
    </div>
  );
}

function FootnoteModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm">
      <div className="step-one-fade-in w-full max-w-[620px] rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_26px_64px_rgba(17,24,39,0.16)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
              Footnotes
            </p>
            <h2 className="font-display mt-3 text-[34px] leading-none text-[#111111] sm:text-[40px]">
              Investor Eligibility
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-[13px] font-medium text-[#374151] transition hover:border-black/30"
          >
            Close
          </button>
        </div>

        <div className="mt-6 h-px bg-black/10" />
        <p className="mt-6 text-[15px] leading-7 text-[#4b5563]">
          Access Properties follows SEC rules regarding investor eligibility.
          Certain private investment opportunities are only available to
          Accredited Investors as defined by the U.S. Securities and Exchange
          Commission (SEC). We ask eligibility questions to ensure we only
          present investment pathways you are legally permitted to access.
        </p>

        <a
          href="https://www.investor.gov/introduction-investing/investing-basics/glossary/accredited-investor"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex text-[14px] font-medium text-[#111111] underline decoration-black/30 underline-offset-[5px] transition hover:text-[#374151]"
        >
          SEC Accredited Investor Definition
        </a>
      </div>
    </div>
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
  showBack,
  onBack,
  onNext,
  nextLabel,
  showError,
  errorMessage = "Please complete this step to continue.",
}) {
  return (
    <div className="sticky bottom-0 border-t border-black/10 bg-white/95 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-[10px]">
      {showError && (
        <p className="mb-3 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {showBack && (
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

function NavigationButtons({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
  nextClassName = "",
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white px-5 text-[15px] font-medium text-[#1f2937] shadow-[0_10px_22px_rgba(17,24,39,0.06)] transition hover:-translate-y-[1px] hover:border-black/40 active:scale-[0.99] sm:w-auto"
        >
          <ArrowIcon direction="left" />
          Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onNext}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-black px-6 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:-translate-y-[1px] hover:bg-[#1f2937] active:scale-[0.99] sm:w-auto ${nextClassName}`}
      >
        {nextLabel}
        <ArrowIcon />
      </button>
    </div>
  );
}

const ADVISOR_INTRO =
  "Hi — I’m your Access Properties advisor. I’ll guide you through your investment setup step by step.";

function StepOneLayout({ onContinue }) {
  const { displayed: typedText } = useTypingEffect(ADVISOR_INTRO, 20, 700);

  return (
    <>
      <div className="sm:hidden">
        <MobileStepSection>
          <div className="mx-auto max-w-[360px] text-center step-one-fade-in">
            <h1 className="font-display text-[38px] leading-[0.98] text-[#111111]">
              Invest with
              <br />
              Access Properties
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#4b5563]">
              Institutional-grade opportunities with expert guidance along the
              way.
            </p>
          </div>

          <div className="mt-7">
            <LifestylePanel mobile />
          </div>

          <div className="-mt-10 relative z-10">
            <AdvisorCard mobile className="step-one-fade-in-delayed">
              <p className="font-display text-[21px] leading-none text-[#111111]">
                Welcome.
              </p>
              <p className="mt-3 min-h-[84px] text-[14px] leading-7 text-[#4b5563]">
                {typedText}
              </p>

              <button
                type="button"
                onClick={onContinue}
                className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-black text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99]"
              >
                Continue
                <ArrowIcon />
              </button>
            </AdvisorCard>
          </div>
        </MobileStepSection>
      </div>

      <div className="hidden sm:block">
        <section className="relative h-full min-h-0 overflow-hidden px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
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

            <div className="step-one-fade-in-delayed absolute right-[12%] top-[40%] z-20 hidden w-full max-w-[336px] -translate-y-1/2 lg:block xl:right-[14%] xl:max-w-[360px]">
              <AdvisorCard>
                <p className="font-display text-[22px] leading-none text-[#111111]">
                  Welcome.
                </p>
                <p className="mt-3 min-h-[84px] text-[14px] leading-7 text-[#4b5563]">
                  {typedText}
                </p>

                <button
                  type="button"
                  onClick={onContinue}
                  className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-black text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99]"
                >
                  Continue
                  <ArrowIcon />
                </button>
              </AdvisorCard>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function WelcomeStep({
  title,
  paragraphs = [],
  bullets = [],
  asideTag,
  asideTitle,
  asideBody = [],
  asideBullets = [],
  onBack,
  onNext,
  nextLabel = "Continue",
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px] text-center">
              <h1 className="font-display text-[38px] leading-[1.02] text-[#111111]">
                {title}
              </h1>
              <div className="mx-auto mt-6 h-px w-full max-w-[300px] bg-black/10" />

              <div className="mt-6 space-y-4">
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[16px] leading-8 text-[#4b5563]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {bullets.length > 0 && (
                <ul className="mt-8 space-y-3 text-left text-[15px] leading-7 text-[#374151]">
                  {bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-3 h-[4px] w-[4px] rounded-full bg-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {secondaryActionLabel && onSecondaryAction && (
                <SecondaryButton
                  onClick={onSecondaryAction}
                  className="mt-8 w-full"
                >
                  {secondaryActionLabel}
                </SecondaryButton>
              )}

              {(asideTitle || asideBullets.length > 0) && (
                <div className="mt-8 rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 text-left shadow-[0_16px_28px_rgba(17,24,39,0.08)]">
                  {asideTag && (
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                      {asideTag}
                    </p>
                  )}
                  {asideTitle && (
                    <p className="mt-3 font-display text-[26px] leading-none text-[#111111]">
                      {asideTitle}
                    </p>
                  )}
                  <div className="mt-4 space-y-3">
                    {asideBody.map((item) => (
                      <p key={item} className="text-[14px] leading-6 text-[#4b5563]">
                        {item}
                      </p>
                    ))}
                  </div>
                  {asideBullets.length > 0 && (
                    <ul className="mt-4 space-y-2 text-[14px] leading-6 text-[#374151]">
                      {asideBullets.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-[10px] h-[4px] w-[4px] rounded-full bg-black" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 lg:grid-cols-[0.52fr_0.48fr]">
            <div className="step-one-fade-in max-w-[560px]">
              <h1 className="font-display text-[50px] leading-[0.98] text-[#111111] xl:text-[62px]">
                {title}
              </h1>
              <div className="mt-7 h-px w-[180px] bg-black/10" />

              <div className="mt-7 space-y-5">
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[18px] leading-8 text-[#4b5563]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {bullets.length > 0 && (
                <ul className="mt-8 space-y-4 text-[17px] leading-8 text-[#374151]">
                  {bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-[14px] h-[4px] w-[4px] rounded-full bg-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {secondaryActionLabel && onSecondaryAction && (
                <SecondaryButton onClick={onSecondaryAction} className="mt-9">
                  {secondaryActionLabel}
                </SecondaryButton>
              )}

              <div className="mt-10 max-w-[420px]">
                <NavigationButtons
                  onBack={onBack}
                  onNext={onNext}
                  nextLabel={nextLabel}
                />
              </div>
            </div>

            <div className="step-one-fade-in-delayed">
              <div className="relative mx-auto max-w-[500px]">
                <LifestylePanel className="min-h-[520px] rounded-[34px] shadow-[0_24px_44px_rgba(118,108,95,0.08)]" />
                <div className="absolute inset-x-[10%] top-[12%] rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-8 shadow-[0_22px_44px_rgba(17,24,39,0.12)]">
                  {asideTag && (
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                      {asideTag}
                    </p>
                  )}
                  {asideTitle && (
                    <h2 className="mt-3 font-display text-[36px] leading-none text-[#111111]">
                      {asideTitle}
                    </h2>
                  )}
                  <div className="mt-4 space-y-3">
                    {asideBody.map((item) => (
                      <p key={item} className="text-[15px] leading-7 text-[#4b5563]">
                        {item}
                      </p>
                    ))}
                  </div>
                  {asideBullets.length > 0 && (
                    <ul className="mt-5 space-y-3 text-[14px] leading-7 text-[#374151]">
                      {asideBullets.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-[12px] h-[4px] w-[4px] rounded-full bg-black" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function ProfileStep({
  profile,
  profileErrors,
  onChange,
  onToggleUpdates,
  onBack,
  onNext,
}) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1 overflow-auto pb-10">
            <div className="mx-auto max-w-[380px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Profile
              </p>
              <h1 className="font-display mt-4 text-[38px] leading-[1.02] text-[#111111]">
                Create your profile.
              </h1>
              <p className="mt-4 text-[16px] leading-7 text-[#4b5563]">
                We’ll use this information to prepare your onboarding and
                investor dashboard.
              </p>

              <div className="mt-8 rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_18px_30px_rgba(17,24,39,0.08)]">
                <div className="grid grid-cols-1 gap-4">
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={onChange}
                    error={profileErrors.firstName}
                    autoComplete="given-name"
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={onChange}
                    error={profileErrors.lastName}
                    autoComplete="family-name"
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={onChange}
                    error={profileErrors.email}
                    type="email"
                    autoComplete="email"
                  />
                  <TextField
                    label="Mobile Phone"
                    name="mobilePhone"
                    value={profile.mobilePhone}
                    onChange={onChange}
                    error={profileErrors.mobilePhone}
                    type="tel"
                    autoComplete="tel"
                  />
                  <TextField
                    label="Address Line 1"
                    name="addressLine1"
                    value={profile.addressLine1}
                    onChange={onChange}
                    error={profileErrors.addressLine1}
                    autoComplete="address-line1"
                  />
                  <TextField
                    label="Address Line 2"
                    name="addressLine2"
                    value={profile.addressLine2}
                    onChange={onChange}
                    error={profileErrors.addressLine2}
                    autoComplete="address-line2"
                  />
                  <TextField
                    label="City"
                    name="city"
                    value={profile.city}
                    onChange={onChange}
                    error={profileErrors.city}
                    autoComplete="address-level2"
                  />
                  <TextField
                    label="State / Province"
                    name="stateProvince"
                    value={profile.stateProvince}
                    onChange={onChange}
                    error={profileErrors.stateProvince}
                    autoComplete="address-level1"
                  />
                  <TextField
                    label="Zip / Postal Code"
                    name="zipPostalCode"
                    value={profile.zipPostalCode}
                    onChange={onChange}
                    error={profileErrors.zipPostalCode}
                    autoComplete="postal-code"
                  />
                  <TextField
                    label="Country"
                    name="country"
                    value={profile.country}
                    onChange={onChange}
                    error={profileErrors.country}
                    autoComplete="country-name"
                  />
                  <CheckboxField
                    checked={profile.receiveUpdates}
                    onChange={onToggleUpdates}
                    label="Receive updates from Access Properties"
                  />
                </div>
              </div>
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue"
            showError={Object.keys(profileErrors).length > 0}
            errorMessage="Please complete the required profile fields."
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto grid w-full max-w-[1320px] min-h-0 items-center gap-10 lg:grid-cols-[0.4fr_0.6fr]">
            <div className="max-w-[430px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Profile
              </p>
              <h1 className="font-display mt-4 text-[50px] leading-[0.98] text-[#111111] xl:text-[58px]">
                Create your profile.
              </h1>
              <div className="mt-7 h-px w-[176px] bg-black/10" />
              <p className="mt-7 text-[18px] leading-8 text-[#4b5563]">
                We’ll use this information to prepare your onboarding and
                investor dashboard.
              </p>
              <p className="mt-5 text-[14px] leading-7 text-[#6b7280]">
                Your details stay within the Access Properties onboarding
                workflow and help us keep the process clear, compliant, and
                efficient.
              </p>
            </div>

            <div className="min-h-0">
              <div className="max-h-[calc(100dvh-180px)] overflow-auto rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-8 shadow-[0_24px_44px_rgba(17,24,39,0.1)]">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={onChange}
                    error={profileErrors.firstName}
                    autoComplete="given-name"
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={onChange}
                    error={profileErrors.lastName}
                    autoComplete="family-name"
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={onChange}
                    error={profileErrors.email}
                    type="email"
                    autoComplete="email"
                  />
                  <TextField
                    label="Mobile Phone"
                    name="mobilePhone"
                    value={profile.mobilePhone}
                    onChange={onChange}
                    error={profileErrors.mobilePhone}
                    type="tel"
                    autoComplete="tel"
                  />
                  <TextField
                    label="Address Line 1"
                    name="addressLine1"
                    value={profile.addressLine1}
                    onChange={onChange}
                    error={profileErrors.addressLine1}
                    autoComplete="address-line1"
                    className="sm:col-span-2"
                  />
                  <TextField
                    label="Address Line 2"
                    name="addressLine2"
                    value={profile.addressLine2}
                    onChange={onChange}
                    error={profileErrors.addressLine2}
                    autoComplete="address-line2"
                    className="sm:col-span-2"
                  />
                  <TextField
                    label="City"
                    name="city"
                    value={profile.city}
                    onChange={onChange}
                    error={profileErrors.city}
                    autoComplete="address-level2"
                  />
                  <TextField
                    label="State / Province"
                    name="stateProvince"
                    value={profile.stateProvince}
                    onChange={onChange}
                    error={profileErrors.stateProvince}
                    autoComplete="address-level1"
                  />
                  <TextField
                    label="Zip / Postal Code"
                    name="zipPostalCode"
                    value={profile.zipPostalCode}
                    onChange={onChange}
                    error={profileErrors.zipPostalCode}
                    autoComplete="postal-code"
                  />
                  <TextField
                    label="Country"
                    name="country"
                    value={profile.country}
                    onChange={onChange}
                    error={profileErrors.country}
                    autoComplete="country-name"
                  />
                  <div className="sm:col-span-2">
                    <CheckboxField
                      checked={profile.receiveUpdates}
                      onChange={onToggleUpdates}
                      label="Receive updates from Access Properties"
                    />
                  </div>
                </div>

                {Object.keys(profileErrors).length > 0 && (
                  <p className="mt-6 text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
                    Please complete the required profile fields.
                  </p>
                )}

                <div className="mt-8 border-t border-black/10 pt-6">
                  <NavigationButtons
                    onBack={onBack}
                    onNext={onNext}
                    nextLabel="Continue"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function ChoiceStep({
  title,
  subtitle,
  prompt,
  helperText,
  notSureText,
  options,
  selectedValue,
  onChoose,
  responseText,
  onBack,
  onNext,
  nextLabel = "Continue",
  showError,
  showDetailsLink = false,
  onShowDetails,
}) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px] text-center">
              <h1 className="font-display text-[36px] leading-[1.02] text-[#111111]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">
                  {subtitle}
                </p>
              )}
              <div className="mt-6 h-px w-full bg-black/10" />
              <p className="mt-6 text-[19px] leading-8 text-[#1f2937]">{prompt}</p>
              {helperText && (
                <p className="mt-4 text-[15px] leading-7 text-[#6b7280]">
                  {helperText}
                </p>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {options.map((option) => (
                <OptionButton
                  key={option.value}
                  id={`mobile-option-${option.value}`}
                  label={option.label}
                  variant="mobile"
                  isSelected={selectedValue === option.value}
                  onClick={() => onChoose(option.value)}
                />
              ))}
            </div>

            {responseText && (
              <div className="mt-6 rounded-[20px] border border-black/10 bg-white px-5 py-4 shadow-[0_10px_20px_rgba(17,24,39,0.05)]">
                <p className="text-[14px] leading-6 text-[#374151]">{responseText}</p>
              </div>
            )}

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

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
            showError={showError}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto flex w-full max-w-[980px] flex-col justify-center">
            <div className="mx-auto max-w-[700px] text-center">
              <h1 className="font-display text-[46px] leading-[1.02] text-[#111111] xl:text-[56px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">{subtitle}</p>
              )}
              <div className="mt-6 h-px w-full bg-black/10" />
              <p className="mt-6 text-[20px] leading-8 text-[#1f2937]">{prompt}</p>
              {helperText && (
                <p className="mx-auto mt-4 max-w-[540px] text-[15px] leading-7 text-[#6b7280]">
                  {helperText}
                </p>
              )}
            </div>

            <div className="mx-auto mt-8 grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
              {options.map((option) => (
                <OptionButton
                  key={option.value}
                  id={`option-${option.value}`}
                  label={option.label}
                  variant="grid"
                  isSelected={selectedValue === option.value}
                  onClick={() => onChoose(option.value)}
                />
              ))}
            </div>

            {responseText && (
              <div className="mx-auto mt-6 max-w-[520px] rounded-[20px] border border-black/10 bg-white px-5 py-4 text-center shadow-[0_10px_20px_rgba(17,24,39,0.05)]">
                <p className="text-[14px] leading-7 text-[#374151]">{responseText}</p>
              </div>
            )}

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

            <div className="mx-auto mt-10 w-full max-w-[640px] border-t border-black/10 pt-5">
              {showError && (
                <p className="mb-4 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
                  Please complete this step to continue.
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
      </div>
    </>
  );
}

function InvestmentAmountStep({
  investmentAmount,
  investmentAmountError,
  onChange,
  onBack,
  onNext,
}) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px] text-center">
              <h1 className="font-display text-[36px] leading-[1.02] text-[#111111]">
                What amount are you considering?
              </h1>
              <div className="mt-6 h-px w-full bg-black/10" />
            </div>

            <div className="mx-auto mt-8 max-w-[380px] rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_16px_28px_rgba(17,24,39,0.08)]">
              <TextField
                label="Estimated Investment Amount"
                name="investmentAmount"
                value={investmentAmount}
                onChange={onChange}
                error={investmentAmountError}
                placeholder="$10,000"
                inputMode="numeric"
              />
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue"
            showError={Boolean(investmentAmountError)}
            errorMessage={investmentAmountError || "Please enter an amount."}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto flex w-full max-w-[920px] flex-col justify-center">
            <div className="mx-auto max-w-[640px] text-center">
              <h1 className="font-display text-[48px] leading-[1.02] text-[#111111] xl:text-[58px]">
                What amount are you considering?
              </h1>
              <div className="mt-6 h-px w-full bg-black/10" />
            </div>

            <div className="mx-auto mt-8 w-full max-w-[520px] rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-6 shadow-[0_18px_34px_rgba(17,24,39,0.08)]">
              <TextField
                label="Estimated Investment Amount"
                name="investmentAmount"
                value={investmentAmount}
                onChange={onChange}
                error={investmentAmountError}
                placeholder="$10,000"
              />
            </div>

            <div className="mx-auto mt-10 w-full max-w-[520px] border-t border-black/10 pt-5">
              {investmentAmountError && (
                <p className="mb-4 text-center text-[12px] font-medium tracking-[0.01em] text-[#ba645b]">
                  {investmentAmountError}
                </p>
              )}
              <NavigationButtons
                onBack={onBack}
                onNext={onNext}
                nextLabel="Continue"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function OverviewStep({ onBack, onNext }) {
  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px] text-center">
              <h1 className="font-display text-[36px] leading-[1.02] text-[#111111]">
                Here’s how investing with Access Properties works.
              </h1>
              <div className="mt-6 h-px w-full bg-black/10" />
            </div>

            <ul className="mx-auto mt-8 max-w-[380px] space-y-3 text-[15px] leading-7 text-[#374151]">
              {HOW_IT_WORKS_BULLETS.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-[4px] w-[4px] rounded-full bg-black" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-8 max-w-[380px] rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_16px_28px_rgba(17,24,39,0.08)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Current Offering
              </p>
              <h2 className="mt-3 font-display text-[28px] leading-none text-[#111111]">
                Access Properties Real Estate Diversified Income Fund I
              </h2>
              <div className="mt-5 overflow-hidden rounded-[20px] border border-black/10">
                <LifestylePanel mobile className="min-h-[180px] rounded-none border-0" />
              </div>
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue"
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 lg:grid-cols-[0.46fr_0.54fr]">
            <div className="max-w-[520px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Overview
              </p>
              <h1 className="font-display mt-4 text-[50px] leading-[0.98] text-[#111111] xl:text-[60px]">
                Here’s how investing with Access Properties works.
              </h1>
              <div className="mt-7 h-px w-[176px] bg-black/10" />
              <ul className="mt-8 space-y-4 text-[17px] leading-8 text-[#374151]">
                {HOW_IT_WORKS_BULLETS.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[14px] h-[4px] w-[4px] rounded-full bg-black" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 max-w-[420px]">
                <NavigationButtons
                  onBack={onBack}
                  onNext={onNext}
                  nextLabel="Continue"
                />
              </div>
            </div>

            <div>
              <div className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-8 shadow-[0_24px_44px_rgba(17,24,39,0.1)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                  Current Offering
                </p>
                <h2 className="mt-3 font-display text-[34px] leading-none text-[#111111]">
                  Access Properties Real Estate Diversified Income Fund I
                </h2>
                <div className="mt-6 overflow-hidden rounded-[26px] border border-black/10">
                  <LifestylePanel className="min-h-[340px] rounded-none border-0" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function BranchMessageStep({ isAccredited, onBack, onNext }) {
  const title = isAccredited
    ? "You’ll be able to invest directly through Access Properties after onboarding is complete."
    : "You’ll complete your onboarding here, and then be guided to our equity crowdfunding partner to finalize your investment.";

  const asideTitle = isAccredited ? "Direct Path" : "Partner Path";
  const asideBody = isAccredited
    ? [
        "You’re moving through the direct Access Properties investor path.",
        "We’ll continue with final eligibility and investor dashboard preparation next.",
      ]
    : [
        "You’ll still complete onboarding here first.",
        "After approval, we’ll guide you to the equity crowdfunding partner for final investment completion.",
      ];

  return (
    <WelcomeStep
      title={title}
      paragraphs={[
        "We’ll keep the next steps focused, transparent, and easy to follow.",
      ]}
      asideTag="Investor Path"
      asideTitle={asideTitle}
      asideBody={asideBody}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Continue"
    />
  );
}

function CreatePasswordStep({ password, passwordConfirm, error, onChange, onBack, onNext }) {
  const submit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <>
      <div className="sm:hidden">
        <form onSubmit={submit} className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px]">
              <h1 className="font-display text-[34px] leading-[1.05] text-[#111111]">
                Create your password
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-[#4b5563]">
                You'll use this to sign in to your investor dashboard and pick
                up where you left off.
              </p>

              <div className="mt-6 space-y-4">
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => onChange("password", event.target.value)}
                  placeholder="At least 8 characters"
                />
                <TextField
                  label="Confirm password"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) =>
                    onChange("passwordConfirm", event.target.value)
                  }
                  placeholder="Re-enter password"
                  error={error || undefined}
                />
              </div>
            </div>
          </MobileStepSection>

          <MobileNavigation
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue"
            errorMessage={error}
          />
        </form>
      </div>

      <div className="hidden sm:flex sm:h-full sm:min-h-0 sm:flex-1">
        <div className="flex w-full">
          <div className="flex flex-1 items-center justify-center px-12 py-16">
            <form onSubmit={submit} className="w-full max-w-[480px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
                Account
              </p>
              <h1 className="mt-3 font-display text-[44px] leading-[1.05] text-[#111111]">
                Create your password
              </h1>
              <p className="mt-4 text-[16px] leading-8 text-[#4b5563]">
                You'll use this to sign in to your investor dashboard and pick
                up where you left off.
              </p>

              <div className="mt-8 space-y-5">
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => onChange("password", event.target.value)}
                  placeholder="At least 8 characters"
                />
                <TextField
                  label="Confirm password"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) =>
                    onChange("passwordConfirm", event.target.value)
                  }
                  placeholder="Re-enter password"
                  error={error || undefined}
                />
              </div>

              <div className="mt-10 flex items-center gap-4">
                <SecondaryButton onClick={onBack}>Back</SecondaryButton>
                <button
                  type="submit"
                  className="inline-flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-black text-[15px] font-medium text-white transition hover:bg-[#111827]"
                >
                  Continue
                  <ArrowIcon />
                </button>
              </div>
            </form>
          </div>

          <LifestylePanel className="hidden lg:flex lg:w-[42%]" />
        </div>
      </div>
    </>
  );
}

function NextStepsStep({ isAccredited, onBack, onNext }) {
  const bulletList = isAccredited
    ? [
        "Complete identity verification",
        "Receive funding instructions",
        "Access legal and operational documents once active",
        "View performance metrics and ongoing communications",
      ]
    : [
        "Complete identity verification",
        "Receive approval to continue through our equity crowdfunding partner",
        "Access legal and operational documents once active",
        "View performance metrics and ongoing communications",
      ];

  const paragraphs = isAccredited
    ? [
        "Next, you’ll be taken to your pending Investor Dashboard to complete the final steps of your onboarding.",
        "Your investment will be activated once funds are received. At that point, you’ll have access to your active Investor Dashboard, including legal and operational documents, performance metrics, and communications.",
      ]
    : [
        "Next, you’ll be taken to your pending Investor Dashboard to complete the final steps of your onboarding, including identity verification.",
        "Once your onboarding is approved, you will receive a link to be redirected to our equity crowdfunding partner to complete your investment through their platform.",
        "At that point, you will have access to your active Investor Dashboard, including legal and operational documents, performance metrics, and communications.",
      ];

  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1">
            <div className="mx-auto max-w-[380px] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Next Steps
              </p>
              <h1 className="font-display mt-4 text-[38px] leading-[1.02] text-[#111111]">
                You’re about 80% complete.
              </h1>
              <div className="mt-6 h-px w-full bg-black/10" />
            </div>

            <div className="mx-auto mt-8 max-w-[380px] rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_16px_28px_rgba(17,24,39,0.08)]">
              <div className="space-y-4">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-7 text-[#4b5563]">
                    {paragraph}
                  </p>
                ))}
              </div>

              <ul className="mt-6 space-y-3 text-[14px] leading-6 text-[#374151]">
                {bulletList.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[10px] h-[4px] w-[4px] rounded-full bg-black" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onNext}
            nextLabel="Continue"
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto grid w-full max-w-[1260px] items-center gap-12 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="max-w-[420px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Next Steps
              </p>
              <h1 className="font-display mt-4 text-[52px] leading-[0.98] text-[#111111] xl:text-[60px]">
                You’re about 80% complete.
              </h1>
              <div className="mt-7 h-px w-[176px] bg-black/10" />
              <div className="mt-10 max-w-[420px]">
                <NavigationButtons
                  onBack={onBack}
                  onNext={onNext}
                  nextLabel="Continue"
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-8 shadow-[0_24px_44px_rgba(17,24,39,0.1)]">
              <div className="space-y-5">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[16px] leading-8 text-[#4b5563]">
                    {paragraph}
                  </p>
                ))}
              </div>

              <ul className="mt-6 space-y-3 text-[15px] leading-7 text-[#374151]">
                {bulletList.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[12px] h-[4px] w-[4px] rounded-full bg-black" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function FAQStep({
  selectedQuestion,
  onSelectQuestion,
  onAskAnother,
  onContinue,
  onBack,
}) {
  const answer = selectedQuestion ? FAQ_CONTENT[selectedQuestion] : "";
  const faqTopics = Object.keys(FAQ_CONTENT);

  return (
    <>
      <div className="sm:hidden">
        <div className="flex min-h-[calc(100dvh-76px)] flex-col">
          <MobileStepSection className="flex-1 overflow-auto pb-10">
            <div className="mx-auto max-w-[400px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Explore
              </p>
              <h1 className="font-display mt-4 text-[38px] leading-[1.02] text-[#111111]">
                What would you like to know?
              </h1>
              <div className="mt-6 h-px w-full bg-black/10" />

              <div className="mt-8 space-y-3">
                {faqTopics.map((topic) => (
                  <OptionButton
                    key={topic}
                    id={`faq-${topic}`}
                    label={topic}
                    variant="faq"
                    isSelected={selectedQuestion === topic}
                    onClick={() => onSelectQuestion(topic)}
                  />
                ))}
              </div>

              <div className="mt-8 rounded-[24px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_16px_28px_rgba(17,24,39,0.08)]">
                {selectedQuestion ? (
                  <>
                    <h2 className="font-display text-[28px] leading-none text-[#111111]">
                      {selectedQuestion}
                    </h2>
                    <p className="mt-4 text-[15px] leading-7 text-[#4b5563]">
                      {answer}
                    </p>
                    <SecondaryButton onClick={onAskAnother} className="mt-5 w-full">
                      Ask another question
                    </SecondaryButton>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-[28px] leading-none text-[#111111]">
                      Explore the details.
                    </h2>
                    <p className="mt-4 text-[15px] leading-7 text-[#4b5563]">
                      Select a question above and I’ll surface a concise answer
                      in the same onboarding flow.
                    </p>
                  </>
                )}
              </div>
            </div>
          </MobileStepSection>

          <MobileNavigation
            showBack
            onBack={onBack}
            onNext={onContinue}
            nextLabel="Continue onboarding"
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto flex w-full max-w-[1320px] min-h-0 flex-col">
            <div className="flex flex-1 min-h-0 flex-col gap-8 lg:flex-row">
              <div className="w-full lg:max-w-[460px]">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                  Explore
                </p>
                <h1 className="font-display mt-4 text-[50px] leading-[0.98] text-[#111111] xl:text-[58px]">
                  What would you like to know?
                </h1>
                <div className="mt-7 h-px w-[176px] bg-black/10" />

                <div className="mt-8 max-h-[calc(100dvh-270px)] overflow-auto pr-2">
                  <div className="space-y-3">
                    {faqTopics.map((topic) => (
                      <OptionButton
                        key={topic}
                        id={`desktop-faq-${topic}`}
                        label={topic}
                        variant="faq"
                        isSelected={selectedQuestion === topic}
                        onClick={() => onSelectQuestion(topic)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1">
                <div className="flex h-full min-h-0 flex-col rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] p-8 shadow-[0_24px_44px_rgba(17,24,39,0.1)]">
                  {selectedQuestion ? (
                    <>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                        Answer
                      </p>
                      <h2 className="font-display mt-4 text-[40px] leading-[0.98] text-[#111111]">
                        {selectedQuestion}
                      </h2>
                      <div className="mt-6 h-px bg-black/10" />
                      <div className="mt-6 min-h-0 flex-1 overflow-auto pr-2">
                        <p className="text-[16px] leading-8 text-[#4b5563]">
                          {answer}
                        </p>
                      </div>
                      <SecondaryButton onClick={onAskAnother} className="mt-6 self-start">
                        Ask another question
                      </SecondaryButton>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                        Answer
                      </p>
                      <h2 className="font-display mt-4 text-[40px] leading-[0.98] text-[#111111]">
                        Explore the details.
                      </h2>
                      <div className="mt-6 h-px bg-black/10" />
                      <p className="mt-6 text-[16px] leading-8 text-[#4b5563]">
                        Select a question from the left and I’ll show a concise
                        answer without taking you out of onboarding.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-black/10 pt-5">
              <NavigationButtons
                onBack={onBack}
                onNext={onContinue}
                nextLabel="Continue onboarding"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function FinalConfirmationStep({
  firstName,
  welcomeEmailPreview,
  investorCode,
  isAccredited,
  onBack,
  onRestart,
}) {
  const continueUrl = isAccredited
    ? "/dashboard"
    : import.meta.env.VITE_WEFUNDER_REDIRECT_URL || "https://wefunder.com";
  const continueLabel = isAccredited
    ? "Continue to your dashboard"
    : "Continue to crowdfunding partner";
  const handleContinue = () => {
    if (isAccredited) {
      window.location.assign(continueUrl);
    } else {
      window.location.href = continueUrl;
    }
  };

  return (
    <>
      <div className="sm:hidden">
        <MobileStepSection className="pb-12">
          <div className="mx-auto max-w-[400px] rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_100%)] px-6 py-8 text-center shadow-[0_18px_34px_rgba(17,24,39,0.08)]">
            <p className="font-display text-[42px] leading-none text-[#111111]">
              You’re all set, {firstName?.trim() || "Investor"}.
            </p>
            <p className="mt-5 text-[15px] leading-7 text-[#4b5563]">
              Please check your email for your Access Properties welcome letter,
              with important details to help you get started.
            </p>
            {investorCode ? (
              <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-[#6b7280]">
                Reference: {investorCode}
              </p>
            ) : null}

            <div className="mt-8 rounded-[22px] border border-black/10 bg-white px-5 py-5 text-left shadow-[0_10px_22px_rgba(17,24,39,0.05)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Welcome Letter
              </p>
              <h2 className="mt-3 font-display text-[28px] leading-none text-[#111111]">
                {welcomeEmailPreview.subject}
              </h2>
              <p className="mt-4 text-[14px] leading-7 text-[#4b5563]">
                From the Desk of Dionysios Kaskarelis, Founder and Chief
                Executive Manager
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <SecondaryButton onClick={onBack} className="w-full">
                <ArrowIcon direction="left" />
                Back
              </SecondaryButton>
              <button
                type="button"
                onClick={handleContinue}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-black px-5 text-[18px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] active:scale-[0.99]"
              >
                {continueLabel}
                <ArrowIcon />
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="text-[13px] font-medium text-[#6b7280] underline"
              >
                Start over
              </button>
            </div>
          </div>
        </MobileStepSection>
      </div>

      <div className="hidden sm:block">
        <section className="flex h-full min-h-0 items-center px-4 py-5 sm:px-8 sm:py-6 lg:px-12">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 lg:grid-cols-[0.44fr_0.56fr]">
            <div className="max-w-[430px]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Final Confirmation
              </p>
              <h1 className="font-display mt-4 text-[54px] leading-[0.96] text-[#111111] xl:text-[62px]">
                You’re all set, {firstName?.trim() || "Investor"}.
              </h1>
              <div className="mt-7 h-px w-[176px] bg-black/10" />
              <p className="mt-7 text-[18px] leading-8 text-[#4b5563]">
                Please check your email for your Access Properties welcome
                letter, with important details to help you get started.
              </p>
              {investorCode ? (
                <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-[#6b7280]">
                  Reference: {investorCode}
                </p>
              ) : null}

              <div className="mt-10 flex max-w-[420px] flex-col gap-3">
                <SecondaryButton onClick={onBack}>
                  <ArrowIcon direction="left" />
                  Back
                </SecondaryButton>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex h-12 items-center justify-center gap-2 rounded-[14px] bg-black px-6 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:-translate-y-[1px] hover:bg-[#1f2937] active:scale-[0.99]"
                >
                  {continueLabel}
                  <ArrowIcon />
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="self-start text-[13px] font-medium text-[#6b7280] underline"
                >
                  Start over
                </button>
              </div>
            </div>

            <div className="rounded-[34px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.98)_100%)] p-9 shadow-[0_24px_44px_rgba(17,24,39,0.1)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
                Welcome Letter
              </p>
              <h2 className="mt-3 font-display text-[34px] leading-none text-[#111111]">
                {welcomeEmailPreview.subject}
              </h2>
              <div className="mt-6 h-px bg-black/10" />
              <p className="mt-6 text-[15px] leading-8 text-[#4b5563] whitespace-pre-line">
                {welcomeEmailPreview.body.split("\n").slice(0, 8).join("\n")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState("welcome-hero");
  const [direction, setDirection] = useState(1);
  const [profile, setProfile] = useState(PROFILE_INITIAL_STATE);
  const [profileErrors, setProfileErrors] = useState({});
  const [experience, setExperience] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentAmountError, setInvestmentAmountError] = useState("");
  const [accreditationStatus, setAccreditationStatus] = useState("");
  const [showStepError, setShowStepError] = useState(false);
  const [selectedFaqQuestion, setSelectedFaqQuestion] = useState("");
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [investorCode, setInvestorCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const activePhase = useMemo(
    () => STEP_PHASE_MAP[currentStep] || 1,
    [currentStep],
  );

  const isAccredited = accreditationStatus === "accredited";
  const welcomeEmailPreview = useMemo(
    () => fillWelcomeEmail(profile.firstName),
    [profile.firstName],
  );

  const experienceResponse = useMemo(() => {
    if (experience === "experienced") return "Great — I’ll keep things efficient.";
    if (experience === "new") return "No problem — I’ll explain things as we go.";
    return "";
  }, [experience]);

  const navigateTo = (nextStep) => {
    setDirection(getStepPosition(nextStep) >= getStepPosition(currentStep) ? 1 : -1);
    setCurrentStep(nextStep);
    setShowStepError(false);
    setProfileErrors({});
    setInvestmentAmountError("");
    if (nextStep !== "faq") {
      setSelectedFaqQuestion("");
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "welcome-help":
        navigateTo("welcome-hero");
        break;
      case "welcome-overview":
        navigateTo("welcome-help");
        break;
      case "welcome-duration":
        navigateTo("welcome-overview");
        break;
      case "faq":
        navigateTo("welcome-duration");
        break;
      case "profile":
        navigateTo("welcome-duration");
        break;
      case "experience":
        navigateTo("profile");
        break;
      case "amount":
        navigateTo("experience");
        break;
      case "overview":
        navigateTo("amount");
        break;
      case "accreditation":
        navigateTo("overview");
        break;
      case "branch-message":
        navigateTo("accreditation");
        break;
      case "next-steps":
        navigateTo("branch-message");
        break;
      case "final-confirmation":
        navigateTo("next-steps");
        break;
      default:
        break;
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const handleToggleUpdates = () => {
    setProfile((prev) => ({
      ...prev,
      receiveUpdates: !prev.receiveUpdates,
    }));
  };

  const handleExperienceChoose = (value) => {
    setExperience(value);
    setShowStepError(false);
  };

  const handleAccreditationChoose = (value) => {
    setAccreditationStatus(value);
    setShowStepError(false);
  };

  const handleAmountChange = (event) => {
    const sanitized = event.target.value.replace(/[^\d,. $kKmMbB]/g, "");
    setInvestmentAmount(sanitized);
    if (investmentAmountError) setInvestmentAmountError("");
  };

  const handleNext = async () => {
    if (submitting) return;
    switch (currentStep) {
      case "welcome-hero":
        navigateTo("welcome-help");
        break;
      case "welcome-help":
        navigateTo("welcome-overview");
        break;
      case "welcome-overview":
        navigateTo("welcome-duration");
        break;
      case "welcome-duration":
        navigateTo("profile");
        break;
      case "faq":
        navigateTo("profile");
        break;
      case "profile": {
        const errors = validateProfile(profile);
        if (Object.keys(errors).length > 0) {
          setProfileErrors(errors);
          scrollToFirstError();
          return;
        }

        // If country is United States, later require proof of U.S. citizenship
        // or permanent residency in the Investor Dashboard flow.
        navigateTo("experience");
        break;
      }
      case "experience":
        if (!experience) {
          setShowStepError(true);
          return;
        }
        navigateTo("amount");
        break;
      case "amount": {
        if (!investmentAmount.trim()) {
          setInvestmentAmountError("Please enter an amount to continue.");
          return;
        }
        const parsed = parseAmount(investmentAmount);
        if (parsed < MIN_INVESTMENT) {
          setInvestmentAmountError(
            "Minimum investment is $10,000. Try '10000', '$10,000', or '10k'.",
          );
          return;
        }
        navigateTo("overview");
        break;
      }
      case "overview":
        navigateTo("accreditation");
        break;
      case "accreditation":
        if (!accreditationStatus) {
          setShowStepError(true);
          return;
        }
        navigateTo("branch-message");
        break;
      case "branch-message":
        navigateTo("create-password");
        break;
      case "create-password": {
        setPasswordError("");
        if (password.length < 8) {
          setPasswordError("Password must be at least 8 characters.");
          return;
        }
        if (password !== passwordConfirm) {
          setPasswordError("Passwords do not match.");
          return;
        }
        navigateTo("next-steps");
        break;
      }
      case "next-steps": {
        setSubmitError("");
        setSubmitting(true);
        try {
          const result = await registerInvestor({
            profile,
            experience,
            investmentAmount,
            accreditationStatus:
              accreditationStatus === "accredited"
                ? "accredited"
                : "not-accredited",
            password,
            passwordConfirmation: passwordConfirm,
          });
          setInvestorCode(result.code);
          navigateTo("final-confirmation");
        } catch (err) {
          const fieldError = err?.response?.data?.errors
            ? Object.values(err.response.data.errors).flat()[0]
            : null;
          const message =
            fieldError ||
            err?.response?.data?.message ||
            "We couldn't create your account. Please try again or contact ops@accessproperties.com.";
          setSubmitError(message);
        } finally {
          setSubmitting(false);
        }
        break;
      }
      default:
        break;
    }
  };

  const restartOnboarding = () => {
    setDirection(-1);
    setCurrentStep("welcome-hero");
    setProfile(PROFILE_INITIAL_STATE);
    setProfileErrors({});
    setExperience("");
    setInvestmentAmount("");
    setInvestmentAmountError("");
    setAccreditationStatus("");
    setShowStepError(false);
    setSelectedFaqQuestion("");
    setShowFootnotes(false);
    setSubmitting(false);
    setSubmitError("");
    setInvestorCode("");
    setPassword("");
    setPasswordConfirm("");
    setPasswordError("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome-hero":
        return <StepOneLayout onContinue={handleNext} />;
      case "welcome-help":
        return (
          <WelcomeStep
            title="I can help you."
            bullets={[
              "Understand how Access Properties works",
              "Choose the right investment approach",
              "Complete onboarding and verification",
            ]}
            asideTag="Guided Setup"
            asideTitle="A calm, guided flow."
            asideBody={[
              "Each step is designed to be clear, efficient, and easy to complete.",
            ]}
            asideBullets={[
              "Premium onboarding experience",
              "Clear progress at every step",
              "Built around trust and transparency",
            ]}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "welcome-overview":
        return (
          <WelcomeStep
            title="Before we begin."
            paragraphs={[
              "Here’s a quick overview of the onboarding process:",
            ]}
            bullets={[
              "Create your profile",
              "Confirm eligibility",
              "Review your investment",
              "Complete your pending Investor Dashboard",
              "Finalize your investment",
              "Access your active Investment Dashboard",
            ]}
            asideTag="Compliance Note"
            asideTitle="Investor eligibility matters."
            asideBody={[
              "Certain investment pathways depend on SEC eligibility rules and offering structure.",
            ]}
            secondaryActionLabel="View footnotes"
            onSecondaryAction={() => setShowFootnotes(true)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "welcome-duration":
        return (
          <WelcomeStep
            title="This takes about 2–3 minutes."
            paragraphs={[
              "We’ll keep the process focused, calm, and easy to move through.",
            ]}
            asideTag="Explore First"
            asideTitle="You can browse before you begin."
            asideBody={[
              "Open the FAQ loop if you’d like more context before moving forward.",
            ]}
            secondaryActionLabel="I would like to explore first"
            onSecondaryAction={() => navigateTo("faq")}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "faq":
        return (
          <FAQStep
            selectedQuestion={selectedFaqQuestion}
            onSelectQuestion={setSelectedFaqQuestion}
            onAskAnother={() => setSelectedFaqQuestion("")}
            onContinue={handleNext}
            onBack={handleBack}
          />
        );
      case "profile":
        return (
          <ProfileStep
            profile={profile}
            profileErrors={profileErrors}
            onChange={handleProfileChange}
            onToggleUpdates={handleToggleUpdates}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "experience":
        return (
          <ChoiceStep
            title="Tell me about your investing experience."
            prompt="Have you invested in real estate or private investments before?"
            options={EXPERIENCE_OPTIONS}
            selectedValue={experience}
            onChoose={handleExperienceChoose}
            responseText={experienceResponse}
            onBack={handleBack}
            onNext={handleNext}
            showError={showStepError}
          />
        );
      case "amount":
        return (
          <InvestmentAmountStep
            investmentAmount={investmentAmount}
            investmentAmountError={investmentAmountError}
            onChange={handleAmountChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "overview":
        return <OverviewStep onBack={handleBack} onNext={handleNext} />;
      case "accreditation":
        return (
          <ChoiceStep
            title="Accreditation check."
            prompt="Do you meet at least one SEC accredited investor criterion?"
            helperText="Annual income over $200,000 (or $300,000 with spouse), OR net worth over $1 million (excluding primary home)."
            options={ACCREDITATION_OPTIONS}
            selectedValue={accreditationStatus}
            onChoose={handleAccreditationChoose}
            onBack={handleBack}
            onNext={handleNext}
            showError={showStepError}
            showDetailsLink
          />
        );
      case "branch-message":
        return (
          <BranchMessageStep
            isAccredited={isAccredited}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "create-password":
        return (
          <CreatePasswordStep
            password={password}
            passwordConfirm={passwordConfirm}
            error={passwordError}
            onChange={(field, value) => {
              if (field === "password") setPassword(value);
              else setPasswordConfirm(value);
              if (passwordError) setPasswordError("");
            }}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "next-steps":
        return (
          <NextStepsStep
            isAccredited={isAccredited}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case "final-confirmation":
        return (
          <FinalConfirmationStep
            firstName={profile.firstName}
            welcomeEmailPreview={welcomeEmailPreview}
            investorCode={investorCode}
            isAccredited={isAccredited}
            onBack={handleBack}
            onRestart={restartOnboarding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] sm:h-dvh sm:overflow-hidden">
      {(submitting || submitError) && (
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
          <div
            role={submitError ? "alert" : "status"}
            className={`pointer-events-auto max-w-[640px] rounded-[14px] px-5 py-3 text-[14px] shadow-[0_14px_28px_rgba(17,24,39,0.16)] ${
              submitError
                ? "bg-[#fdecea] text-[#7a2e26]"
                : "bg-black text-white"
            }`}
          >
            {submitting && !submitError
              ? "Creating your account..."
              : submitError}
            {submitError && (
              <button
                type="button"
                onClick={() => setSubmitError("")}
                className="ml-3 underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
      <div className="relative flex min-h-screen flex-col overflow-hidden sm:h-full sm:min-h-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(229,231,235,0.85),transparent_30%),linear-gradient(135deg,#f5f5f5_0%,#ffffff_52%,#f3f4f6_100%)]" />
          <div className="absolute left-[-14%] top-[18%] h-80 w-80 rounded-full bg-black/5 blur-3xl" />
          <div className="absolute right-[-8%] top-[30%] h-96 w-96 rounded-full bg-black/6 blur-3xl" />
        </div>

        <div className="relative z-20">
          <OnboardingHeader activePhase={activePhase} />
        </div>

        <main className="relative z-10 flex-1 sm:min-h-0 sm:overflow-hidden">
          <AnimatedStepWrapper
            key={currentStep}
            direction={direction}
            className="h-full sm:min-h-0"
          >
            {renderCurrentStep()}
          </AnimatedStepWrapper>
        </main>

        {showFootnotes && <FootnoteModal onClose={() => setShowFootnotes(false)} />}
      </div>
    </div>
  );
}
