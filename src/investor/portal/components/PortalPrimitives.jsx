import { Building2, Info, Layers, MapPin, Target } from "lucide-react";

import {
  formatCurrencyDetailed,
  formatDateNumeric,
  formatPercent,
  formatSignedCurrency,
  formatUnitsFixed,
  gainColor,
} from "../lib/format";

/**
 * The four-metric strip. It appears three times — the portfolio snapshot, the
 * fund card on the overview, and the fund detail header — and must read
 * identically in all three, so it is one component with a size variant rather
 * than three near-copies.
 */
/**
 * A disclosure attached to the figure it qualifies.
 *
 * Group-hover and focus-within rather than a click: it is an explanation of a
 * number already on screen, not a control, and it must be reachable by keyboard
 * as well as pointer.
 */
function MetricNote({ children }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="About this figure"
        className="grid h-3.5 w-3.5 place-items-center rounded-full text-[#9ca3af] transition hover:text-[#4b5563] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3d3e]"
      >
        <Info className="h-3 w-3" />
      </button>
      {/* Anchored to the icon's left edge and sitting below it, so it opens
          into the card rather than across the figures either side. `hidden`
          rather than invisible-with-opacity: an absolutely positioned box that
          is merely transparent still counts toward the document's scroll
          width, and at 400px this one was pushing the page 170px wide. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-6 z-30 hidden w-[min(280px,calc(100vw-2rem))] rounded-[10px] border border-black/10 bg-white p-3 text-[12px] font-normal leading-5 text-[#1f2937] shadow-[0_12px_32px_rgba(15,61,62,0.18)] group-hover:block group-focus-within:block"
      >
        {children}
      </span>
    </span>
  );
}

export function MetricStrip({ metrics, size = "md", cols = 4, className = "" }) {
  const valueSize =
    size === "lg" ? "text-[22px] md:text-[30px]" : "text-[18px] md:text-[17px]";

  // 2x2 on a phone, where four across would be 80px a cell. Dividers come from
  // a 1px gap over a tinted background rather than divide-x, which puts a stray
  // left border on the first cell of the second row in a two-column grid.
  const grid =
    cols === 2
      ? "grid-cols-2 gap-px bg-black/10"
      : "grid-cols-2 gap-px bg-black/10 wide:grid-cols-4 wide:gap-0 wide:bg-transparent wide:divide-x wide:divide-black/10";

  return (
    <div className={`grid items-stretch wide:items-start ${grid} ${className}`}>
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`min-w-0 bg-white ${
            size === "lg" ? "px-4 py-4 md:px-6 md:py-6" : "px-3 py-3 md:px-2"
          }`}
        >
          {/* Fixed height: the note icon is taller than the label text, and
              without this the cell carrying it pushes its value below the
              other three. */}
          <div className="flex h-4 items-center gap-1.5">
            {m.icon ? (
              <span className="hidden h-7 w-7 place-items-center rounded-full border border-black/10 text-[#0f3d3e] md:grid">
                <m.icon className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <span className="truncate whitespace-nowrap text-[12px] leading-tight text-[#4b5563]">
              {m.label}
            </span>
            {m.note ? <MetricNote>{m.note}</MetricNote> : null}
          </div>
          <p
            className={`font-display mt-2 ${valueSize} leading-none tabular-nums md:whitespace-nowrap`}
            style={{ color: m.color ?? "#111111" }}
          >
            {m.value}
          </p>
          {m.sub ? (
            <p
              className="mt-1.5 text-[11px] md:text-[12px]"
              style={{ color: m.subColor ?? "#9ca3af" }}
            >
              {m.sub}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Builds the four metrics both fund screens show, from one breakdown payload,
 * so the overview and the detail page cannot drift apart.
 */
export function portfolioMetrics(totals, { currentValueNote } = {}) {
  return [
    {
      label: "Amount Invested",
      icon: undefined,
      value: formatCurrencyDetailed(totals.contribution),
    },
    {
      label: "Current Value",
      value: formatCurrencyDetailed(totals.unitsValue),
      sub: formatDateNumeric(totals.unitValueAsOf),
      note: currentValueNote,
    },
    {
      label: "Total Return",
      value: formatSignedCurrency(totals.gain),
      color: gainColor(totals.gain),
      sub: formatPercent(totals.gainPct),
      subColor: gainColor(totals.gainPct),
    },
    {
      label: "Units Held",
      value: formatUnitsFixed(totals.units),
    },
  ];
}

/**
 * Investment Focus / Market / Structure.
 *
 * Rows with no value are dropped rather than rendered with a dash. Two of the
 * three have no column on `funds` yet, and an em dash beside "Market" reads as
 * a fund with no market rather than a field nobody has filled in.
 */
export function AttributeRows({ fund }) {
  const rows = [
    { icon: Target, label: "Investment Focus", value: fund?.investmentFocus },
    { icon: MapPin, label: "Market", value: fund?.market },
    { icon: Layers, label: "Structure", value: fund?.fundType },
  ].filter((r) => r.value);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-black/5">
      {/* Rows wrap rather than overflow: on a narrow screen a long value used
          to be pushed past the right edge and disappear entirely. */}
      {rows.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 md:py-3.5"
        >
          <span className="flex min-w-0 items-center gap-3 text-[13px] text-[#111111] md:text-[14px]">
            <Icon className="h-4 w-4 shrink-0 text-[#111111]" strokeWidth={1.5} />
            {label}
          </span>
          <span className="min-w-0 break-words text-left text-[13px] text-[#64748b] md:text-right md:text-[14px]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The line-art fund mark used on the overview card. */
export function FundGlyph({ className = "h-12 w-12" }) {
  return (
    <Building2
      className={`${className} text-[#111111]`}
      strokeWidth={1}
      aria-hidden="true"
    />
  );
}
