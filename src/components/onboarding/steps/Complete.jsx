import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  Landmark,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import OnboardingShell from "../OnboardingShell";

const NEXT_STEPS = [
  {
    icon: ShieldCheck,
    title: "Verify your identity",
    detail: "Securely verify your identity to protect your account.",
  },
  {
    icon: UserCheck,
    title: "Complete investor qualification",
    detail: "Provide information to confirm your investor eligibility.",
  },
  {
    icon: FileText,
    title: "Review and sign offering documents",
    detail: "Access and e-sign required offering documents.",
  },
  {
    icon: Landmark,
    title: "Receive investment funding instructions",
    detail: "Get step-by-step instructions to fund your investment.",
  },
  {
    icon: BarChart3,
    title: "Access portfolio updates and investor communications",
    detail: "Stay informed with updates on your investments and portfolio performance.",
  },
];

function NextStep({ icon: Icon, title, detail, index }) {
  return (
    <li className="flex items-start gap-4 py-5">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
        <Icon className="h-6 w-6" />
      </span>
      <span className="font-display w-7 shrink-0 text-[24px] leading-none text-[#9ca3af]">
        {index + 1}
      </span>
      <div className="flex-1">
        <h4 className="text-[16px] font-semibold leading-tight text-[#111111]">
          {title}
        </h4>
        <p className="mt-1 text-[14px] leading-6 text-[#4b5563]">{detail}</p>
      </div>
    </li>
  );
}

function Complete({ onBack, onContinueToPortal, onDotClick, stepLabels }) {
  return (
    <OnboardingShell
      dots={6}
      activeDot={5}
      stepLabel="STEP 6 OF 6"
      dotLabel="COMPLETE"
      onDotClick={onDotClick}
      stepLabels={stepLabels}
    >
      <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — welcome */}
        <section>
          <h1 className="font-display text-[48px] leading-[1.05] text-[#111111] xl:text-[64px]">
            Welcome to
            <br />
            Access Properties
          </h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-7 text-[#4b5563]">
            We're excited to have you join our investor community.
          </p>

          {/* Email card */}
          <div className="mt-7 flex items-start gap-4 rounded-[16px] border border-black/8 bg-[#f7f5f1] p-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
              <Mail className="h-6 w-6" />
            </span>
            <div className="flex flex-1 items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#111111] text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <p className="text-[14px] leading-7 text-[#1f2937]">
                A welcome email has been sent to your inbox with information
                about your account and the resources available to you.
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-[500px] text-[14px] leading-7 text-[#4b5563]">
            Your investor account has been created successfully and you can
            continue to your portal at any time.
          </p>

          {/* Buttons — Back to LEFT of Continue, grouped together */}
          <div className="mt-8 flex items-center gap-3">
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
              onClick={onContinueToPortal}
              aria-label="Continue to Portal"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-7 text-[15px] font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.18)] transition hover:bg-[#1f2937]"
            >
              Continue to Portal
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Right — what happens next */}
        <section>
          <div className="rounded-[24px] border border-black/8 bg-[#f7f5f1] p-7 sm:p-8">
            <h2 className="font-display text-[32px] leading-tight text-[#111111]">
              What happens next
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
              Your onboarding will continue inside your investor portal.
            </p>

            <ol className="mt-4 divide-y divide-black/8">
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
