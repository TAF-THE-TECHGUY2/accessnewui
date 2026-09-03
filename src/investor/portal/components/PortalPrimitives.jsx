import { Building2, Layers, MapPin, Target } from "lucide-react";

import {
  formatCurrencyDetailed,
  formatDateNumeric,
  formatPercent,
  formatUnitsFixed,
  gainColor,
} from "../lib/format";

/**
 * The four-metric strip. It appears three times — the portfolio snapshot, the
 * fund card on the overview, and the fund detail header — and must read
 * identically in all three, so it is one component with a size variant rather
 * than three near-copies.
 */
export function MetricStrip({ metrics, size = "md", cols = 4, className = "" }) {
  const valueSize = size === "lg" ? "text-[32px]" : "text-[20px]";

  // Four across needs a full-width container; in a narrow one the figures
  // collide. `cols={2}` gives a 2x2 block for the fund detail's left column.
  const grid =
    cols === 2
      ? "grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x [&>*:nth-child(-n+2)]:sm:border-b [&>*:nth-child(-n+2)]:sm:border-black/10 [&>*:nth-child(odd)]:sm:border-l-0"
      : "grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x";

  return (
    <div className={`grid divide-black/10 ${grid} ${className}`}>
      {metrics.map((m) => (
        <div key={m.label} className={size === "lg" ? "px-6 py-6" : "px-5 py-4"}>
          <div className="flex items-center gap-2">
            {m.icon ? (
              <span className="grid h-7 w-7 place-items-center rounded-full border border-black/10 text-[#0f3d3e]">
                <m.icon className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <span className="text-[13px] text-[#4b5563]">{m.label}</span>
          </div>
          <p
            className={`font-display mt-2 ${valueSize} leading-none`}
            style={{ color: m.color ?? "#111111" }}
          >
            {m.value}
          </p>
          {m.sub ? (
            <p
              className="mt-1.5 text-[12px]"
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
export function portfolioMetrics(totals) {
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
    },
    {
      label: "Total Return",
      value: `${totals.gain >= 0 ? "+" : ""}${formatCurrencyDetailed(totals.gain)}`,
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
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center justify-between gap-4 py-3.5">
          <span className="flex items-center gap-3 text-[14px] text-[#111111]">
            <Icon className="h-4 w-4 text-[#111111]" strokeWidth={1.5} />
            {label}
          </span>
          <span className="text-right text-[14px] text-[#64748b]">{value}</span>
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
