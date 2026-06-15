import {
  ArrowLeft,
  ArrowRight,
  Building,
  DollarSign,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  Target,
  UserCog,
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
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#111111] ring-1 ring-black/10">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[14px] font-medium text-[#1f2937]">{label}</p>
      </div>
      <p className="text-right text-[14px] text-[#111111]">{value}</p>
    </div>
  );
}

function CurrentOffering({ onBack, onNext }) {
  return (
    <OnboardingShell dots={5} activeDot={2} dotLabel="OFFERING" showFootnotes={false}>
      {/* Stretch the grid to fill the remaining viewport so the page reads as a
          full-bleed layout rather than a small chunk at the top */}
      <div className="grid min-h-[calc(100vh-180px)] items-stretch gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — narrative */}
        <section className="flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
            Current Offering
          </p>
          <h1 className="font-display mt-3 text-[44px] leading-[1.05] text-[#111111] xl:text-[56px]">
            {FUND_OVERVIEW.shortName}
          </h1>
          <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#4b5563]">
            {FUND_OVERVIEW.description}
          </p>

          {/* Feature block flex-grows so the buttons sit at the bottom of the column */}
          <div className="mt-8 flex-1 divide-y divide-black/10 border-y border-black/10">
            <div className="flex items-start gap-4 py-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Building className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[20px] leading-tight text-[#111111]">
                  What We Invest In
                </h3>
                <p className="mt-2 max-w-[460px] text-[14px] leading-7 text-[#4b5563]">
                  {FUND_OVERVIEW.whatWeInvestIn}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-[20px] leading-tight text-[#111111]">
                  How We Create Value
                </h3>
                <p className="mt-2 max-w-[460px] text-[14px] leading-7 text-[#4b5563]">
                  {FUND_OVERVIEW.howWeCreateValue}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons pinned to the bottom of the column */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-black/15 bg-white px-6 text-[14px] font-medium text-[#111111] transition hover:border-black/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Continue"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-8 text-[14px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
            >
              Continue
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Right — Fund overview card, stretches to full column height */}
        <section className="flex">
          <div className="flex w-full flex-col overflow-hidden rounded-[20px] border border-black/8 bg-white">
            <div className="px-7 pt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Fund Overview
              </p>
              <h2 className="font-display mt-3 text-[30px] leading-tight text-[#111111]">
                {FUND_OVERVIEW.shortName}
              </h2>
            </div>

            <div className="mt-5 flex-1 divide-y divide-black/8 border-t border-black/8 px-7">
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
              <OverviewRow
                icon={ShieldCheck}
                label="Investor Type"
                value={FUND_OVERVIEW.investorType}
              />
            </div>

            {/* Card footer — distinct background */}
            <button
              type="button"
              className="flex w-full items-center justify-between bg-[#f7f5f1] px-7 py-5 text-[14px] font-medium text-[#111111] transition hover:bg-[#efece4]"
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
    </OnboardingShell>
  );
}

export default CurrentOffering;
