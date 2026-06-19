// AP brand logo lives in /public so it can also be used by the ecosystem card.
const logo = "/assets/AP.png";

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
const SEC_FOOTNOTES_URL = "https://www.sec.gov/investor";

function OnboardingShell({
  children,
  dots = 5,
  activeDot = 0,
  dotLabel = "",
  stepLabel = "",
  showFootnotes = false,
  variant = "card",
  onDotClick,
  stepLabels,
}) {
  return (
    <div className={`bg-[#f8f8f6] text-[#111111] ${variant === "bleed" ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"}`}>
      <header className="sticky top-0 z-30 shrink-0 bg-[#f8f8f6] px-6 py-5 sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="" aria-hidden="true" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            <p className="text-[20px] font-medium text-[#111111] sm:text-[22px]">
              Access Properties
            </p>
          </div>

          <div className="flex items-center gap-4">
            <StepDots
              dots={dots}
              activeDot={activeDot}
              onDotClick={onDotClick}
              stepLabels={stepLabels}
            />
            {dotLabel || stepLabel ? (
              <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#111111] sm:text-[14px]">
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
          <div className="flex justify-end lg:pl-[45%]">
            <div className="flex items-start gap-2.5 max-w-[600px] text-[13px] leading-6 text-[#6b7280]">
              <InfoCircle />
              <p>
                <span className="font-semibold text-[#111111]">Investor Resources:</span>{" "}
                Access{" "}
                <a
                  href={SEC_FOOTNOTES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-black/30 underline-offset-[4px] hover:text-[#111111] hover:decoration-black"
                >
                  educational materials and investor protection information
                </a>{" "}
                provided by the U.S. Securities and Exchange Commission.
              </p>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function StepDots({ dots, activeDot, onDotClick, stepLabels }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: dots }).map((_, i) => {
        const isActive = i === activeDot;
        const isVisited = i < activeDot;
        const isClickable = !!onDotClick && isVisited;
        const baseClass = `h-2.5 w-2.5 rounded-full transition ${
          isActive
            ? "bg-[#111111]"
            : isVisited
            ? "bg-[#111111]/40"
            : "bg-black/15"
        }`;
        const label = stepLabels?.[i] || `Step ${i + 1}`;

        return isClickable ? (
          <button
            key={i}
            type="button"
            onClick={() => onDotClick(i)}
            title={`Go to ${label}`}
            aria-label={`Go to ${label}`}
            className={`${baseClass} cursor-pointer ring-offset-2 hover:bg-[#111111] hover:ring-2 hover:ring-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]`}
          />
        ) : (
          <span key={i} className={baseClass} aria-current={isActive ? "step" : undefined} />
        );
      })}
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
