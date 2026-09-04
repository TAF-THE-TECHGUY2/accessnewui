/**
 * Display formatters shared by the Investment overview and the fund detail
 * page. They live here rather than in either page because the two screens show
 * the same figures and must format them identically — a units count that reads
 * 57,500.00 on one screen and 57,500 on the other invites the question of which
 * is right.
 */

export const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

/**
 * Collapses negative zero.
 *
 * A gain of -0.00000175 rounds to -0.0 server-side, and JavaScript treats -0 as
 * >= 0 while Intl renders it as "-$0.00" — which is how a row came to read
 * "+-$0.00" in production. Every signed figure runs through here first.
 */
const denormalise = (v) => (Object.is(v, -0) || v === 0 ? 0 : v);

export const formatCurrencyDetailed = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(denormalise(amount ?? 0));

/** A signed currency figure: "+$1,234.00", "-$99.00", "$0.00" for nothing. */
export const formatSignedCurrency = (amount) => {
  const v = denormalise(amount ?? 0);

  return `${v > 0 ? "+" : ""}${formatCurrencyDetailed(v)}`;
};

export const formatPercent = (value) => {
  const v = denormalise(value ?? 0);

  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
};

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

/** MM/DD/YYYY, for the as-of stamp under Current Value. */
export const formatDateNumeric = (iso) => {
  if (!iso) return "—";
  // A bare YYYY-MM-DD is parsed as UTC midnight, which renders as the previous
  // day west of Greenwich. The as-of date is a calendar date, not an instant.
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return y && m && d ? `${m}/${d}/${y}` : "—";
};

export const formatUnits = (v) =>
  (v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 6 });

/** Units on the summary tiles, where the design fixes two decimals. */
export const formatUnitsFixed = (v) =>
  (v ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Unit prices to six decimals.
 *
 * Not cosmetic: at two decimals three separate purchases at $10.000000,
 * $10.008152 and $10.028164 collapse into $10.00 / $10.01 / $10.03, and the
 * middle two become indistinguishable. This column is what the fund manager
 * reconciles against his workbook.
 */
export const formatPrice = (v) =>
  v == null
    ? "—"
    : `$${v.toLocaleString("en-US", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })}`;

/** Gains are green, losses red, everywhere. */
export const GAIN = "#16a34a";
export const LOSS = "#b91c1c";

export const gainColor = (v) => ((v ?? 0) >= 0 ? GAIN : LOSS);
