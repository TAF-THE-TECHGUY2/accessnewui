import { ArrowRight, ListChecks, ShieldCheck, Sliders, TrendingUp } from "lucide-react";
import OnboardingShell from "../OnboardingShell";
import logo from "../../../assets/Logo.png";

const FEATURES = [
  {
    icon: TrendingUp,
    label: "Professionally Managed Investments",
  },
  {
    icon: Sliders,
    label: "Flexible Investment Options",
  },
  {
    icon: ListChecks,
    label: "Step-by-Step Investor Onboarding",
  },
];

function Welcome({ onBegin, onExplore }) {
  return (
    <OnboardingShell dots={5} activeDot={0} dotLabel="WELCOME">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — hero */}
        <section>
          <h1 className="font-display text-[44px] leading-[1.02] text-[#111111] sm:text-[56px] xl:text-[64px]">
            Invest with
            <br />
            Access Properties
          </h1>

          <p className="mt-6 max-w-[480px] text-[15px] leading-7 text-[#4b5563]">
            We make private real estate investment accessible through a
            professionally managed platform built for transparency, security,
            and long-term value.
          </p>

          <ul className="mt-10 max-w-[460px] divide-y divide-black/10">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[15px] font-medium text-[#111111]">{label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-2 text-[12px] text-[#6b7280]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Managed by Access Investment Management, Inc.
          </div>
        </section>

        {/* Right — CTA card */}
        <section className="relative">
          <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_24px_64px_rgba(17,24,39,0.08)] sm:p-10">
            <div className="flex items-center gap-3 border-b border-black/10 pb-5">
              <img src={logo} alt="Access Properties" className="h-14 w-14 object-contain" />
              <div className="h-9 w-px bg-black/15" />
              <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#111111]">
                Access Properties
              </p>
            </div>

            <h2 className="font-display mt-6 text-[44px] leading-tight text-[#111111]">
              Welcome.
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-[#4b5563]">
              This process will guide you through available investment
              opportunities, eligibility requirements, investor qualification,
              and account setup.
            </p>

            <div className="mt-8 h-px bg-black/10" />

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={onBegin}
                aria-label="Begin onboarding"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
              >
                Begin Onboarding
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={onExplore}
                aria-label="Explore first"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-black/15 bg-white text-[15px] font-medium text-[#111111] transition hover:border-black/40"
              >
                Explore First
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}

export default Welcome;
