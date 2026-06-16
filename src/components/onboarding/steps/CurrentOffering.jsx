import { useState } from "react";
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

function FundDetailsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(17,24,39,0.18)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b border-black/8 px-8 pt-7 pb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Fund Details
            </p>
            <h2 className="font-display mt-2 text-[32px] leading-tight text-[#111111]">
              {FUND_OVERVIEW.shortName}
            </h2>
            <p className="mt-1 text-[13px] text-[#6b7280]">{FUND_OVERVIEW.legalName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-[#4b5563] transition hover:border-black/40 hover:text-[#111111]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-8 py-6">
          <p className="text-[15px] leading-7 text-[#4b5563]">
            {FUND_OVERVIEW.description}
          </p>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Building className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-display text-[17px] text-[#111111]">What We Invest In</h4>
                <p className="mt-1.5 text-[13px] leading-6 text-[#4b5563]">
                  {FUND_OVERVIEW.whatWeInvestIn}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-display text-[17px] text-[#111111]">How We Create Value</h4>
                <p className="mt-1.5 text-[13px] leading-6 text-[#4b5563]">
                  {FUND_OVERVIEW.howWeCreateValue}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-[14px] border border-black/8 bg-[#f7f5f1] p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              At a glance
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Investment Focus", FUND_OVERVIEW.investmentFocus],
                ["Market", FUND_OVERVIEW.market],
                ["Structure", FUND_OVERVIEW.structure],
                ["Management", FUND_OVERVIEW.management],
                ["Minimum Investment", formatCurrency(FUND_OVERVIEW.minimumInvestment)],
                ["Investor Type", FUND_OVERVIEW.investorType],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[#6b7280]">{k}</dt>
                  <dd className="mt-0.5 text-[14px] text-[#111111]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/8 px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#111111] px-6 text-[14px] font-medium text-white hover:bg-[#1f2937]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CurrentOffering({ onBack, onNext }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <OnboardingShell dots={5} activeDot={2} dotLabel="OFFERING">
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
              <OverviewRow
                icon={ShieldCheck}
                label="Investor Type"
                value={FUND_OVERVIEW.investorType}
              />
            </div>

            {/* Card footer — opens modal instead of navigating away */}
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

      {showDetails ? <FundDetailsModal onClose={() => setShowDetails(false)} /> : null}
    </OnboardingShell>
  );
}

export default CurrentOffering;
