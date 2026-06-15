import { ArrowLeft, ArrowRight } from "lucide-react";
import OnboardingShell from "../OnboardingShell";
import { ECOSYSTEM } from "../../../styles/theme";
import logo from "../../../assets/Logo.png";

const NEXT_STEPS = [
  "Create your investor account",
  "Confirm eligibility requirements",
  "Review available investment opportunities",
  "Complete investor qualification",
  "Process your investment",
  "Access your investor dashboard",
];

function EcosystemCard({ code, fullName, role }) {
  // Name lives in a fixed 52px slot, top-aligned. Because the slot is always
  // the same height regardless of how the text wraps, the divider sits at
  // exactly the same Y across all 4 cards.
  return (
    <div className="flex h-full flex-col rounded-[14px] border border-black/8 bg-white p-4 text-center">
      <p className="font-display text-[24px] leading-none text-[#111111]">
        {code}
      </p>
      <div className="mt-3 flex h-[44px] items-start justify-center">
        <p className="text-[9px] leading-[1.4] uppercase tracking-[0.04em] text-[#6b7280]">
          {fullName}
        </p>
      </div>
      <div className="mt-auto border-t border-black/10 pt-3">
        <span className="inline-block min-w-[110px] whitespace-nowrap rounded bg-[#f2f1ee] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#4b5563]">
          {role}
        </span>
      </div>
    </div>
  );
}

function HowItWorks({ onBack, onNext }) {
  return (
    <OnboardingShell dots={6} activeDot={1} stepLabel="STEP 2 OF 6">
      <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left — explanation + ecosystem */}
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b7280]">
            How Access Properties Works
          </p>
          <p className="mt-4 max-w-[520px] text-[15px] leading-7 text-[#4b5563]">
            Access Properties brings together an investment vehicle, investment
            management, operational oversight, and a digital investor platform
            into a coordinated investment experience.
          </p>

          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Ecosystem
              </p>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ECOSYSTEM.map((entity) => (
                <EcosystemCard key={entity.code} {...entity} />
              ))}
            </div>
          </div>
        </section>

        {/* Right — "What happens next" card */}
        <section>
          <div className="rounded-[24px] border border-black/8 bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <img src={logo} alt="Access Properties" className="h-10 w-10 object-contain" />
              <div className="h-7 w-px bg-black/15" />
              <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#111111]">
                Access Properties
              </p>
            </div>

            <h2 className="font-display mt-5 text-[28px] leading-tight text-[#111111]">
              What happens next
            </h2>

            <p className="mt-2 text-[13px] text-[#6b7280]">You will:</p>

            <ol className="mt-4 divide-y divide-black/8 border-t border-black/8">
              {NEXT_STEPS.map((label, idx) => (
                <li key={label} className="flex items-center gap-3 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f1ee] text-[12px] font-semibold text-[#111111]">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] text-[#1f2937]">{label}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* Page-level navigation — outside both columns so the card stays compact */}
      <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-black/15 bg-white px-5 text-[14px] font-medium text-[#111111] transition hover:border-black/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Continue"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#111111] px-6 text-[14px] font-medium text-white transition hover:bg-[#1f2937]"
        >
          Continue
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </OnboardingShell>
  );
}

export default HowItWorks;
