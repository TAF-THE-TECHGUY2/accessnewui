import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  DollarSign,
  Landmark,
  Layers,
  MapPin,
  Target,
  UserCog,
  X,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";
import { FUND_OVERVIEW } from "../../../styles/theme";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function OverviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#111111] ring-1 ring-black/10">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[15px] font-medium text-[#1f2937]">{label}</p>
      </div>
      <p className="text-right text-[15px] text-[#111111]">{value}</p>
    </div>
  );
}

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

function FundDetailsModal({ onClose, onInvestNow }) {
  const stats = FUND_OVERVIEW.detailStats || [];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(17,24,39,0.18)]">
        {/* Close button — floats top-right over the lime banner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-[#4b5563] transition hover:border-black/40 hover:text-[#111111]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Lime gradient banner with logo card — ported from the main site */}
        <div className="relative shrink-0">
          <div className="h-28 bg-gradient-to-r from-lime-100 via-lime-50 to-white" />
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0 flex items-start px-6 pt-5">
            <div className="inline-flex items-center rounded-lg border border-black/10 bg-white px-3 py-2 shadow-sm">
              <img
                src="/assets/AP.png"
                alt="Access Properties"
                className="h-7 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-7 pb-9 pt-7 md:px-9 md:pb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
            Portfolio
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
            {FUND_OVERVIEW.shortName}
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-gray-600 md:text-[15px]">
            {FUND_OVERVIEW.description}
          </p>

          {/* Stats table */}
          <div className="mt-8 overflow-hidden rounded-xl border border-black/10 bg-white">
            {stats.map((row, idx) => {
              const lines = getStatLabelLines(row.label);
              return (
                <div
                  key={`${row.label}-${idx}`}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-5 text-sm transition-colors hover:bg-gray-50 md:gap-6 md:px-6 ${
                    idx !== stats.length - 1 ? "border-b border-gray-200/80" : ""
                  }`}
                >
                  <span className="min-w-0 pr-2 leading-relaxed text-gray-500">
                    <span className="block">{lines.primary}</span>
                    {lines.secondary ? (
                      <span className="mt-1 block text-[13px] text-gray-500">
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

          {/* Learn More / Invest Now CTA */}
          <div className="mt-8">
            <button
              type="button"
              onClick={onInvestNow}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-semibold text-white shadow-sm transition hover:bg-black hover:shadow"
            >
              Invest Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {FUND_OVERVIEW.footnote ? (
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              {FUND_OVERVIEW.footnote}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CurrentOffering({ onBack, onNext, onDotClick, stepLabels }) {
  const [showDetails, setShowDetails] = useState(false);

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

        {/* Right — Fund overview card */}
        <section>
          <div className="flex w-full flex-col overflow-hidden rounded-[20px] border border-black/8 bg-white">
            <div className="px-7 pt-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Fund Overview
              </p>
              <h2 className="font-display mt-3 text-[32px] leading-tight text-[#111111]">
                {FUND_OVERVIEW.shortName}
              </h2>
            </div>

            <div className="mt-4 divide-y divide-black/8 border-t border-black/8 px-7">
              <OverviewRow
                icon={MapPin}
                label="Investment Focus"
                value={FUND_OVERVIEW.investmentFocus}
              />
              <OverviewRow icon={MapPin} label="Market" value={FUND_OVERVIEW.market} />
              <OverviewRow icon={Layers} label="Structure" value={FUND_OVERVIEW.structure} />
              <OverviewRow
                icon={UserCog}
                label="Management"
                value={FUND_OVERVIEW.management}
              />
              <OverviewRow
                icon={DollarSign}
                label="Minimum Investment"
                value={formatCurrency(FUND_OVERVIEW.minimumInvestment)}
              />
            </div>

            {/* "View Fund Details" sits where the Investor Type row used to be */}
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="flex w-full items-center justify-between bg-[#f7f5f1] px-7 py-5 text-[15px] font-medium text-[#111111] transition hover:bg-[#efece4]"
            >
              <span className="flex items-center gap-2.5">
                <Landmark className="h-4 w-4" />
                View Fund Details
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>

      {showDetails ? (
        <FundDetailsModal
          onClose={() => setShowDetails(false)}
          onInvestNow={() => {
            setShowDetails(false);
            onNext();
          }}
        />
      ) : null}
    </OnboardingShell>
  );
}

export default CurrentOffering;
