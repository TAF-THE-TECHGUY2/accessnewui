import logo from "../../assets/Logo.png";

/**
 * The chrome around every onboarding page: top bar with logo + step dots,
 * a slot for page content, and an optional footnotes link.
 *
 * Pass `dots` = total number of dots, `activeDot` = 0-indexed current.
 * Use `dotLabel` to show "WELCOME" / "PROFILE" / etc. next to the dots.
 *
 * Use `variant="card"` (default) for the standard background; `variant="bleed"`
 * removes the page padding so a child can render a full-bleed split layout
 * (used by the Profile step's hero photo).
 */
function OnboardingShell({
  children,
  dots = 5,
  activeDot = 0,
  dotLabel = "",
  stepLabel = "",
  showFootnotes = true,
  variant = "card",
}) {
  return (
    <div className={`bg-[#f8f8f6] text-[#111111] ${variant === "bleed" ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"}`}>
      <header className="sticky top-0 z-30 shrink-0 bg-[#f8f8f6] px-6 py-4 sm:px-10 sm:py-5">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" aria-hidden="true" className="h-10 w-10 object-contain" />
            <p className="text-[14px] font-medium text-[#111111]">
              Access Properties
            </p>
          </div>

          <div className="flex items-center gap-4">
            <StepDots dots={dots} activeDot={activeDot} />
            {dotLabel || stepLabel ? (
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-[#111111]">
                {dotLabel || stepLabel}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <main
        className={
          variant === "bleed"
            ? "relative flex-1 overflow-hidden"
            : "relative mx-auto max-w-[1280px] px-6 py-5 sm:px-10 sm:py-6"
        }
      >
        {children}
      </main>

      {showFootnotes && variant !== "bleed" ? (
        <footer className="mx-auto max-w-[1280px] px-6 pb-5 sm:px-10 sm:pb-6">
          {/* Sits under the right column on the split layouts. On single-column
              screens it just stacks at the bottom-right. */}
          <div className="flex justify-end lg:pl-[55%]">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[12px] text-[#6b7280] underline decoration-black/20 underline-offset-[5px] hover:text-[#111111]"
            >
              <InfoCircle />
              Need additional information? View Footnotes
            </button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function StepDots({ dots, activeDot }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition ${
            i === activeDot ? "bg-[#111111]" : i < activeDot ? "bg-[#111111]/40" : "bg-black/15"
          }`}
        />
      ))}
    </div>
  );
}

function InfoCircle() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="4.5" r="0.9" fill="currentColor" />
      <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default OnboardingShell;
