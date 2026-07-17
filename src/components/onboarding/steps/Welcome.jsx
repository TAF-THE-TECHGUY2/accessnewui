import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import OnboardingShell from "../OnboardingShell";
const logo = "/assets/AP.png";
const SEC_FOOTNOTES_URL = "https://www.sec.gov/investor";

const FEATURES = [
  {
    icon: Building2,
    label: "Direct accredited investment in ARE I",
  },
  {
    icon: CircleDollarSign,
    label: "Minimum investment: $10,000",
  },
  {
    icon: ShieldCheck,
    label: "Accredited status verified before commitment",
  },
  {
    icon: FileText,
    label: "Offering documents available before commitment",
  },
];

function Welcome({ onBegin }) {
  return (
    <OnboardingShell dotLabel="ACCREDITED PATHWAY">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* Left — hero */}
        <section>
          <h1 className="font-display text-[38px] leading-[1.02] text-[#111111] sm:text-[46px] xl:text-[54px]">
            Invest in Access
            <br />
            Real Estate I
          </h1>

          <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[#4b5563]">
            Begin the direct accredited investor application for the fund&rsquo;s
            private offering through a secure digital process.
          </p>

          <ul className="mt-5 max-w-[520px] divide-y divide-black/10">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[15px] font-medium text-[#111111]">{label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
            <ShieldCheck className="h-4 w-4" />
            Managed by Access Investment Management, Inc.
          </div>
        </section>

        {/* Right — CTA card */}
        <section className="relative">
          <div className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(17,24,39,0.08)] sm:p-8">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <img src={logo} alt="Access Properties" className="h-12 w-12 object-contain" />
              <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#111111]">
                Accredited Investor Onboarding
              </p>
            </div>

            <h2 className="font-display mt-4 text-[36px] leading-tight text-[#111111]">
              Welcome.
            </h2>

            <p className="mt-3 text-[15px] leading-6 text-[#4b5563]">
              Create your investor account to access offering documents,
              confirm eligibility requirements, and continue through the
              accredited investor process step by step.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={onBegin}
                aria-label="Create investor account"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111111] text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
              >
                Create Investor Account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <Link
                to="/faq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Accredited investor FAQs (opens in a new tab)"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white text-[15px] font-medium text-[#111111] transition hover:border-black/40"
              >
                Accredited Investor FAQs
                <ExternalLink className="h-4 w-4" />
              </Link>
              <p className="text-center text-[12px] text-[#6b7280]">
                Opens in a new tab so you do not lose your place.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 text-[13px] leading-6 text-[#6b7280]">
            <Info className="mt-1 h-3.5 w-3.5 shrink-0" />
            <p>
              <span className="font-semibold text-[#111111]">Investor Resources:</span>{" "}
              Review{" "}
              <a
                href={SEC_FOOTNOTES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/30 underline-offset-[4px] hover:text-[#111111] hover:decoration-black"
              >
                investor education and protection information
              </a>{" "}
              provided by the U.S. Securities and Exchange Commission.
            </p>
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}

export default Welcome;
