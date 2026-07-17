import { ArrowRight, Check, Mail } from "lucide-react";

import OnboardingShell from "../OnboardingShell";

const NEXT_STEPS = [
  {
    title: "Review offering documents",
    detail:
      "Access and download the fund's offering materials before making an investment commitment.",
  },
  {
    title: "Verify your identity",
    detail: "Confirm your identity through the secure verification process.",
  },
  {
    title: "Verify accredited investor status",
    detail: "Complete the required third-party accreditation verification.",
  },
  {
    title: "Complete subscription documents",
    detail: "Review and sign the applicable subscription documents.",
  },
  {
    title: "Fund your subscription",
    detail: "Receive instructions and submit your investment funding.",
  },
  {
    title: "Investment activated",
    detail:
      "Receive confirmation and access ongoing investment information and reporting.",
  },
];

function NextStep({ title, detail, index }) {
  return (
    <li className="flex items-start gap-3.5 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#111111] text-[13px] font-medium text-white">
        {index + 1}
      </span>
      <div className="flex-1">
        <h4 className="text-[15px] font-semibold leading-tight text-[#111111]">
          {title}
        </h4>
        <p className="mt-0.5 text-[13px] leading-5 text-[#4b5563]">{detail}</p>
      </div>
    </li>
  );
}

function Complete({ onContinueToPortal }) {
  return (
    <OnboardingShell>
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — account ready */}
        <section>
          <h1 className="font-display text-[40px] leading-[1.05] text-[#111111] xl:text-[52px]">
            Your Investor
            <br />
            Account Is Ready
          </h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-[#4b5563]">
            Continue to the investor portal to review the offering documents
            and complete the accredited investor onboarding process.
          </p>

          {/* Email confirmation banner */}
          <div className="mt-5 flex max-w-[520px] items-center gap-4 rounded-[16px] border border-black/8 bg-[#f7f5f1] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
              <Mail className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <p className="text-[14px] leading-6 text-[#1f2937]">
                A confirmation email has been sent to your inbox.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={onContinueToPortal}
              aria-label="Continue to Investor Portal"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-8 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
            >
              Continue to Investor Portal
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Right — what happens next */}
        <section>
          <div className="rounded-[24px] border border-black/8 bg-white p-6 shadow-[0_24px_64px_rgba(17,24,39,0.06)] sm:p-7">
            <h2 className="font-display text-[26px] leading-tight text-[#111111]">
              What happens next
            </h2>
            <p className="mt-1.5 text-[13px] leading-6 text-[#4b5563]">
              Inside the investor portal, you will:
            </p>

            <ol className="mt-2 divide-y divide-black/8">
              {NEXT_STEPS.map((step, idx) => (
                <NextStep key={step.title} {...step} index={idx} />
              ))}
            </ol>
          </div>
        </section>
      </div>
    </OnboardingShell>
  );
}

export default Complete;
