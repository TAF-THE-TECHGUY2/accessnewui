import {
  ArrowLeft,
  ArrowRight,
  Building,
  Target,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";
import { FUND_OVERVIEW } from "../../../styles/theme";

// Splits a label like "Minimum Investment\n(Accredited Investors – Direct Offering)"
// into a primary first line and an optional secondary parenthetical second line.
function getStatLabelLines(label) {
  const text = String(label || "").trim();
  if (!text) return { primary: "", secondary: "" };
  const manualBreaks = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (manualBreaks.length > 1) {
    return { primary: manualBreaks[0], secondary: manualBreaks.slice(1).join(" ") };
  }
  const trailingParen = text.match(/^(.*?)(\s*\([^)]*\))$/);
  if (trailingParen) {
    return { primary: trailingParen[1].trim(), secondary: trailingParen[2].trim() };
  }
  return { primary: text, secondary: "" };
}

function CurrentOffering({ onBack, onNext, onDotClick, stepLabels }) {
  return (
    <OnboardingShell
      dots={6}
      activeDot={3}
      stepLabel="STEP 4 OF 6"
      onDotClick={onDotClick}
      stepLabels={stepLabels}
    >
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — narrative */}
        <section>
          <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Current Offering
          </p>
          <h1 className="font-display mt-3 text-[48px] leading-[1.05] text-[#111111] xl:text-[60px]">
            {FUND_OVERVIEW.shortName}
          </h1>
          <p className="mt-5 max-w-[560px] text-[17px] leading-7 text-[#4b5563]">
            {FUND_OVERVIEW.description}
          </p>

          <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
            <div className="flex items-start gap-4 py-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Building className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[22px] leading-tight text-[#111111]">
                  What We Invest In
                </h3>
                <p className="mt-2 max-w-[500px] text-[15px] leading-7 text-[#4b5563]">
                  {FUND_OVERVIEW.whatWeInvestIn}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[22px] leading-tight text-[#111111]">
                  How We Create Value
                </h3>
                <p className="mt-2 max-w-[500px] text-[15px] leading-7 text-[#4b5563]">
                  {FUND_OVERVIEW.howWeCreateValue}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons — Back to LEFT of Continue, grouped on the right */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-black/15 bg-white px-6 text-[15px] font-medium text-[#111111] transition hover:border-black/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Continue"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-7 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
            >
              Continue
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Right — Fund details, shown inline (no modal) */}
        <section>
          <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white">
            {FUND_OVERVIEW.detailStats.map((row, idx) => {
              const lines = getStatLabelLines(row.label);
              const isLast = idx === FUND_OVERVIEW.detailStats.length - 1;
              return (
                <div
                  key={`${row.label}-${idx}`}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-6 py-4 text-[14px] transition-colors hover:bg-gray-50 md:gap-6 md:px-7 ${
                    isLast ? "" : "border-b border-gray-200/80"
                  }`}
                >
                  <span className="min-w-0 pr-2 leading-relaxed text-gray-500">
                    <span className="block">{lines.primary}</span>
                    {lines.secondary ? (
                      <span className="mt-0.5 block text-[12px] text-gray-500">
                        {lines.secondary}
                      </span>
                    ) : null}
                  </span>
                  <span className="whitespace-nowrap pt-0.5 text-right font-semibold text-gray-900">
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}

export default CurrentOffering;
