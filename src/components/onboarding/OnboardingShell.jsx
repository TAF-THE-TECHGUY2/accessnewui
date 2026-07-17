// AP brand logo lives in /public so it can also be used by the ecosystem card.
const logo = "/assets/AP.png";

/**
 * The chrome around every onboarding page: top bar with logo + wordmark on
 * the left and an optional letter-spaced caps label on the right (e.g.
 * "ACCREDITED PATHWAY"), a slot for page content, and an optional
 * investor-resources footnote.
 *
 * Use `variant="card"` (default) for the standard background; `variant="bleed"`
 * removes the page padding so a child can render a full-bleed split layout
 * (used by the Create Account page's hero photo).
 */
const SEC_FOOTNOTES_URL = "https://www.sec.gov/investor";

function OnboardingShell({
  children,
  dotLabel = "",
  stepLabel = "",
  showFootnotes = false,
  variant = "card",
}) {
  return (
    <div className={`flex flex-col bg-[#f8f8f6] text-[#111111] ${variant === "bleed" ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      <header className="sticky top-0 z-30 shrink-0 bg-[#f8f8f6] px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" aria-hidden="true" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
            <p className="text-[17px] font-medium text-[#111111] sm:text-[18px]">
              Access Properties
            </p>
          </div>

          {dotLabel || stepLabel ? (
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#111111] sm:text-[14px]">
              {dotLabel || stepLabel}
            </p>
          ) : null}
        </div>
      </header>

      <main
        className={
          variant === "bleed"
            ? "relative flex-1 overflow-hidden"
            : "relative mx-auto flex w-full max-w-[1280px] flex-col px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10"
        }
      >
        {children}
      </main>

      {showFootnotes && variant !== "bleed" ? (
        <footer className="mx-auto max-w-[1280px] px-6 pb-5 sm:px-10 sm:pb-6">
          <div className="flex justify-end lg:pl-[42%]">
            <div className="flex items-start gap-2.5 max-w-[700px] text-[13px] leading-6 text-[#6b7280]">
              <InfoCircle />
              <p>
                <span className="font-semibold text-[#111111]">Investor Resources:</span>{" "}
                Review{" "}
                <a
                  href={SEC_FOOTNOTES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-black/30 underline-offset-[4px] hover:text-[#111111] hover:decoration-black"
                >
                  investor education and protection information
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

function InfoCircle() {
  return (
    <svg viewBox="0 0 16 16" className="mt-1 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="4.5" r="0.9" fill="currentColor" />
      <path d="M8 7v4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default OnboardingShell;
