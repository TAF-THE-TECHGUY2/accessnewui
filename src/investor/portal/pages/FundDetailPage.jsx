import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  DollarSign,
  Info,
  Percent,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useParams } from "react-router-dom";

import {
  fetchBreakdown,
  fetchHoldingDistributions,
  fetchHoldingFees,
  fetchHoldingPriceHistory,
  fetchHoldingProperties,
  fetchHoldings,
} from "../../../services/investorPortalService";
import StripeFundingPanel from "../../components/StripeFundingPanel";
import PropertyCard from "../components/PropertyCard";
import {
  AttributeRows,
  MetricStrip,
  portfolioMetrics,
} from "../components/PortalPrimitives";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  formatPercent,
  formatPrice,
  formatSignedCurrency,
  formatUnits,
  gainColor,
} from "../lib/format";
import { Unvalued } from "./InvestmentPage";

/**
 * Explains a negative position caused by the entry premium.
 *
 * An investor who pays book value plus a premium is underwater the moment they
 * buy, by exactly the premium. That is the deal they agreed to, not a loss —
 * but unexplained it reads as a bug and generates support tickets.
 *
 * Note the premium shows as a smaller percentage of the position than the rate
 * charged: a 5% premium on top of book value is 5/105 of what was actually paid.
 * Both figures are shown so the two reconcile.
 */
function PremiumNote({ holding }) {
  // null is not zero. The API sends null when any deposit has no published book
  // value to compare against, and treating that as 0 is what fabricated a
  // "$7.90 book value plus a 26.8% entry premium" against a real $10.01 entry.
  const entry =
    holding.entryPrice != null ? `$${holding.entryPrice.toFixed(4)}` : "—";

  if (holding.premiumPaid == null || holding.entryBookValue == null) {
    return (
      <>
        <p>
          You entered at <strong>{entry}</strong> per unit.
        </p>
        <p className="mt-1.5">
          A deposit predates the published price series, so there is no book
          value to compare that entry against. Your units, contributions and
          current value are unaffected.
        </p>
      </>
    );
  }

  if (holding.premiumPaid <= 0) {
    return (
      <p>
        You entered at <strong>{entry}</strong> per unit, at the book value
        ruling on your deposit dates.
      </p>
    );
  }

  return (
    <>
      <p>
        You entered at <strong>${(holding.entryPrice ?? 0).toFixed(2)}</strong>{" "}
        per unit — the <strong>${holding.entryBookValue.toFixed(2)}</strong>{" "}
        book value plus a{" "}
        <strong>{(holding.premiumPct ?? 0).toFixed(1)}% entry premium</strong>{" "}
        of {formatCurrencyDetailed(holding.premiumPaid)}.
      </p>
      <p className="mt-1.5">
        {holding.gainLoss < 0
          ? "Your position shows a paper loss because the premium is not yet recovered. That is expected — it reflects entering an established portfolio."
          : "That premium has been recovered — your position is above what you paid."}
      </p>
    </>
  );
}

/**
 * True below the md breakpoint.
 *
 * Some of this page cannot be solved with CSS alone — an eight-column table has
 * to become cards, and the chart has to drop axis ticks — so the breakpoint is
 * read in JavaScript too, from the same 768px the classes use.
 */
function useIsNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e) => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  return narrow;
}

/**
 * NAV per unit over the fund's published history.
 *
 * The fund's book value, not the investor's position — so it is drawn from the
 * published price series and carries no dependence on when anyone invested.
 */
function NavHistoryChart({ fundCode }) {
  const [points, setPoints] = useState(null);
  const isNarrow = useIsNarrow();

  useEffect(() => {
    let cancelled = false;
    fetchHoldingPriceHistory(fundCode)
      .then((data) => {
        if (!cancelled) setPoints(data || []);
      })
      .catch(() => {
        if (!cancelled) setPoints([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fundCode]);

  const data = useMemo(
    () =>
      (points || []).map((p) => ({
        ...p,
        // "3/2023" rather than "Q1 2023" — the axis is a timeline, and a
        // quarter label repeats the granularity the spacing already shows.
        label: p.date
          ? `${Number(String(p.date).slice(5, 7))}/${String(p.date).slice(0, 4)}`
          : p.quarter,
      })),
    [points],
  );

  const latest = data.length > 0 ? data[data.length - 1].price : null;

  // March and September of each year, plus whatever the series ends on. Left to
  // itself the axis drops labels unevenly as the series grows; naming them keeps
  // the spacing regular and the last quarter always visible.
  // March and September of each year, plus whatever the series ends on. Left to
  // itself the axis drops labels unevenly as the series grows; naming them keeps
  // the spacing regular and the last quarter always visible. On a phone only
  // every March survives, or the labels collide.
  const ticks = useMemo(() => {
    const pattern = isNarrow ? /^3\// : /^(3|9)\//;
    const wanted = data.filter((d) => pattern.test(d.label)).map((d) => d.label);
    const last = data.at(-1)?.label;

    if (!last || wanted.includes(last)) {
      return wanted;
    }

    // The final quarter always gets a label, but not next to one it would sit
    // on top of: 3/2026 and 6/2026 are one data point apart and overlapped.
    const lastIndex = data.length - 1;
    const previous = wanted.at(-1);
    const previousIndex = data.findIndex((d) => d.label === previous);
    const tooClose = lastIndex - previousIndex < 2;

    return [...(tooClose ? wanted.slice(0, -1) : wanted), last];
  }, [data, isNarrow]);

  return (
    <section className="min-w-0 rounded-[12px] border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(15,61,62,0.06)] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-[16px] leading-tight text-[#111111] md:text-[18px]">
          NAV Per Unit History
        </h2>
        {latest != null ? (
          <p className="font-display text-[18px] leading-none text-[#111111]">
            {latest.toFixed(2)}
          </p>
        ) : null}
      </div>

      <div className="mt-3 h-[200px] md:h-[220px]">
        {points == null ? (
          <p className="grid h-full place-items-center text-[13px] text-[#6b7280]">
            Loading…
          </p>
        ) : data.length === 0 ? (
          <p className="grid h-full place-items-center text-[13px] text-[#6b7280]">
            No unit values published yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 28, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                ticks={ticks}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                // Fixed rather than fitted to the data: a domain that moves with
                // the series makes two quarters' charts incomparable, and the
                // whole-number ticks give the gridlines a readable step.
                type="number"
                scale="linear"
                domain={[8, 14]}
                ticks={[8, 9, 10, 11, 12, 13, 14]}
                allowDecimals
                tickFormatter={(v) => v.toFixed(1)}
                width={40}
              />
              <Tooltip
                // No crosshair: the default vertical cursor line reads as a
                // pinned annotation once the pointer has been anywhere near it.
                cursor={false}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
                formatter={(v) => [`$${Number(v).toFixed(4)}`, "NAV per unit"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#000000"
                strokeWidth={2}
                fill="none"
                isAnimationActive={false}
                // Only the newest point is marked; a dot on every quarter turns
                // the series into a scatter and hides the shape.
                dot={(dot) =>
                  dot.index === data.length - 1 ? (
                    <circle
                      key={dot.index}
                      cx={dot.cx}
                      cy={dot.cy}
                      r={4}
                      fill="#000000"
                    />
                  ) : null
                }
                activeDot={{ r: 4, fill: "#000000" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="mt-4 text-[12px] leading-5 text-[#6b7280]">
        Calculated using changes in NAV per unit and distributions.
      </p>
      <p className="mt-1 text-[12px] font-semibold leading-5 text-[#4b5563]">
        Past performance is not indicative of future results.
      </p>
    </section>
  );
}

/**
 * Per-investment table. Every column is computed to the fund manager's formulas:
 * unit price is contribution / units, holding period runs from the deposit date
 * to the unit value's as-of date over 365.25 days, and the annualized figure is
 * (1 + gain%)^(1/years) - 1.
 *
 * Purchase Price is rendered to six decimals and Years Held is kept, both
 * against the reference design. At two decimals three purchases at $10.000000,
 * $10.008152 and $10.028164 read as $10.00 / $10.01 / $10.03, and the middle two
 * become the same number; the units-weighted holding period has no other home.
 * Those two columns are what the fund manager reconciles against his workbook.
 */
/**
 * One deposit, as a card.
 *
 * Eight columns cannot be read at 400px and a sideways-scrolling table hides
 * the two columns an investor looks for first, so below md the same figures are
 * stacked as label/value pairs instead.
 */
function DepositCard({ row, total = false }) {
  const pairs = total
    ? [
        ["Amount Invested", formatCurrencyDetailed(row.contribution)],
        ["%", "100.00%"],
        ["Units Held", formatUnits(row.units)],
        ["Purchase Price", formatCurrencyDetailed(row.weightedAverageUnitPrice)],
        ["Current Value", formatCurrencyDetailed(row.unitsValue)],
      ]
    : [
        ["Amount Invested", formatCurrencyDetailed(row.contribution)],
        ["%", `${row.contributionPct.toFixed(2)}%`],
        ["Units Held", formatUnits(row.units)],
        ["Purchase Price", formatCurrencyDetailed(row.unitPrice)],
        ["Current Value", formatCurrencyDetailed(row.unitsValue)],
      ];

  const gain = total ? row.gain : row.gain;
  const gainPct = total ? row.gainPct : row.gainPct;
  const annualized = row.annualizedReturnPct;
  const unvalued = !total && row.valuedAtDeposit;

  return (
    <div
      className={`rounded-[10px] border p-3 ${
        total ? "border-black/20 bg-[#fafafa]" : "border-black/10 bg-white"
      }`}
    >
      <p className="text-[13px] font-semibold text-[#111111]">
        {total ? "Total" : row.depositDate}
      </p>
      <dl className="mt-2 space-y-1.5">
        {pairs.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-[13px]">
            <dt className="text-[#64748b]">{label}</dt>
            <dd className="text-right text-[#111111]">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-black/5 pt-1.5 text-[13px]">
          <dt className="text-[#64748b]">Total Return</dt>
          <dd className="text-right">
            {unvalued ? (
              <span className="text-[#64748b]">not yet valued</span>
            ) : (
              <>
                <span className="block" style={{ color: gainColor(gain) }}>
                  {formatSignedCurrency(gain)}
                </span>
                <span
                  className="block text-[12px]"
                  style={{ color: gainColor(gainPct) }}
                >
                  {formatPercent(gainPct)}
                </span>
              </>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3 text-[13px]">
          <dt className="text-[#64748b]">Annualized</dt>
          <dd
            className="text-right"
            style={{ color: unvalued ? "#64748b" : gainColor(annualized) }}
          >
            {unvalued ? "—" : formatPercent(annualized)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function InvestmentHistoryTable({ rows, totals }) {
  const cell = "px-1.5 py-2 text-right";

  return (
    <section className="min-w-0 rounded-[12px] border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(15,61,62,0.06)] md:p-6">
      <h2 className="font-display text-[16px] leading-tight text-[#111111] md:text-[18px]">
        Investment History
      </h2>

      <div className="mt-3 space-y-2 md:hidden">
        {rows.map((r) => (
          <DepositCard key={r.transactionId} row={r} />
        ))}
        <DepositCard row={totals} total />
      </div>

      <div className="mt-4 hidden md:block">
        <table className="w-full text-[13px] tabular-nums">
          <thead className="text-[11px] text-[#64748b]">
            <tr className="border-b border-black/10">
              <th className="whitespace-nowrap px-1.5 py-2 text-left font-medium">
                Deposit Date
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Amount Invested
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                %
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Units Held
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Purchase Price
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Current Value
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Total Return
              </th>
              <th className="whitespace-nowrap px-1.5 py-2 text-right font-medium">
                Annualized
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.transactionId} className="border-b border-black/5">
                <td className="whitespace-nowrap px-1.5 py-2 text-left text-[#111111]">
                  {r.depositDate}
                </td>
                <td className={`${cell} text-[#111111]`}>
                  {formatCurrencyDetailed(r.contribution)}
                </td>
                <td className={`${cell} text-[#64748b]`}>
                  {r.contributionPct.toFixed(2)}%
                </td>
                <td className={`${cell} text-[#111111]`}>
                  {formatUnits(r.units)}
                </td>
                {/* Two decimals, as the design has it. The three purchase
                    prices stay distinct at that precision — $10.00, $10.01 and
                    $10.03 — so nothing is lost here. The weighted average in
                    the Total row does collide with a row at two decimals, so
                    that one keeps its own. */}
                <td
                  className={`${cell} text-[#111111]`}
                  title={formatPrice(r.unitPrice)}
                >
                  {formatCurrencyDetailed(r.unitPrice)}
                </td>
                <td className={`${cell} text-[#111111]`}>
                  {formatCurrencyDetailed(r.unitsValue)}
                </td>
                <td className={cell}>
                  {r.valuedAtDeposit ? (
                    <span className="block text-[#64748b]">not yet valued</span>
                  ) : (
                    <>
                      <span
                        className="block font-medium"
                        style={{ color: gainColor(r.gain) }}
                      >
                        {formatSignedCurrency(r.gain)}
                      </span>
                      <span
                        className="block text-[11px]"
                        style={{ color: gainColor(r.gainPct) }}
                      >
                        {formatPercent(r.gainPct)}
                      </span>
                    </>
                  )}
                </td>
                <td
                  className={cell}
                  style={{
                    color: r.valuedAtDeposit
                      ? "#64748b"
                      : gainColor(r.annualizedReturnPct),
                  }}
                  title={
                    r.valuedAtDeposit
                      ? undefined
                      : `over ${r.holdingYears.toFixed(4)} years held`
                  }
                >
                  {r.valuedAtDeposit
                    ? "—"
                    : formatPercent(r.annualizedReturnPct)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-semibold">
            <tr className="border-t border-black/20">
              <td className="px-2 py-2 text-left text-[#111111]">Total</td>
              <td className={`${cell} text-[#111111]`}>
                {formatCurrencyDetailed(totals.contribution)}
              </td>
              <td className={`${cell} text-[#64748b]`}>100.00%</td>
              <td className={`${cell} text-[#111111]`}>
                {formatUnits(totals.units)}
              </td>
              {/* The full-precision weighted average is on the title rather
                  than under the figure: at two decimals it is indistinguishable
                  from a single deposit's price, but as visible subtext it was
                  clutter the design does not have. */}
              <td
                className={`${cell} text-[#111111]`}
                title={`${formatPrice(totals.weightedAverageUnitPrice)} weighted average`}
              >
                {formatCurrencyDetailed(totals.weightedAverageUnitPrice)}
              </td>
              <td className={`${cell} text-[#111111]`}>
                {formatCurrencyDetailed(totals.unitsValue)}
              </td>
              <td className={cell}>
                <span
                  className="block"
                  style={{ color: gainColor(totals.gain) }}
                >
                  {formatSignedCurrency(totals.gain)}
                </span>
                <span
                  className="block text-[11px]"
                  style={{ color: gainColor(totals.gainPct) }}
                >
                  {formatPercent(totals.gainPct)}
                </span>
              </td>
              <td
                className={cell}
                style={{ color: gainColor(totals.annualizedReturnPct) }}
                title={`over ${totals.weightedAverageHoldingPeriodYears.toFixed(4)} years, units-weighted`}
              >
                {formatPercent(totals.annualizedReturnPct)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {totals.hasUnvaluedDeposits ? (
        <p className="mt-3 flex items-start gap-2 rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          One or more deposits was made after {totals.unitValueAsOf}, the date
          of the latest published unit price, so those units cannot be valued
          yet.
        </p>
      ) : null}
    </section>
  );
}

function ActionTile({ icon: Icon, label, sub, active, primary, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-full flex-col items-center justify-center gap-1.5 rounded-[12px] border px-2 text-center transition ${
        primary
          ? "border-black bg-black text-white hover:bg-[#1f2937]"
          : active
            ? "border-black/40 bg-white text-[#111111]"
            : "border-black/10 bg-white text-[#111111] hover:border-black/30"
      }`}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-full border ${
          primary ? "border-white/40" : "border-black/15"
        }`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <span className="text-[13px] font-medium leading-tight md:text-[13px]">{label}</span>
      <span
        className={`text-[11px] leading-tight ${primary ? "text-white/70" : "text-[#9ca3af]"}`}
      >
        {sub}
      </span>
    </button>
  );
}

/**
 * Additional subscription into a fund the investor already holds.
 *
 * Two steps on purpose: the amount is captured first, then handed to the Stripe
 * panel. Nothing is created server-side until an amount is submitted, so simply
 * viewing this page never mints a PaymentIntent.
 */
function InvestMorePanel({ fundName, onFunded }) {
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  if (confirmed != null) {
    return (
      <div className="space-y-3">
        <StripeFundingPanel topUpAmount={confirmed} onFunded={onFunded} />
        <button
          type="button"
          onClick={() => {
            setConfirmed(null);
            setAmount("");
          }}
          className="text-sm text-[#6b7280] underline underline-offset-4 hover:text-[#111111]"
        >
          Change amount
        </button>
      </div>
    );
  }

  const parsed = Number(amount);
  const valid = amount !== "" && Number.isFinite(parsed) && parsed > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) setConfirmed(parsed);
      }}
    >
      <h3 className="font-display text-[20px] leading-tight text-[#111111]">
        Invest more in {fundName}
      </h3>
      <p className="mt-2 text-sm text-[#4b5563]">
        New units are issued at the fund&rsquo;s current book value on the day
        your payment settles, not at today&rsquo;s price.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="25,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-11 w-full rounded-[12px] border border-black/10 pl-7 pr-3 text-[13px] outline-none focus:border-teal-600"
          />
        </div>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-11 items-center rounded-[12px] bg-black px-6 text-[13px] font-medium text-white transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-black disabled:opacity-100"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function MiniTable({ head, rows, empty }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#9ca3af]">{empty}</p>;
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-black/10">
      <table className="w-full text-sm">
        <thead className="bg-[#f5f5f5] text-[11px] uppercase tracking-[0.12em] text-[#6b7280]">
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2 ${i === 0 ? "text-left" : "text-right"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, idx) => (
            <tr key={idx} className="border-t border-black/5">
              {cells.map((c, i) => (
                <td
                  key={i}
                  className={`px-4 py-2 ${
                    i === 0 ? "text-left text-[#6b7280]" : "text-right text-ink"
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FundDetailPage() {
  const { code } = useParams();
  const [holding, setHolding] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [unvaluedMessage, setUnvaluedMessage] = useState(null);
  const [distributions, setDistributions] = useState({ data: [], total: 0 });
  const [fees, setFees] = useState({
    aum: [],
    performance: [],
    totalAum: 0,
    totalPerformance: 0,
    aumRatePct: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panel, setPanel] = useState(null);
  // Properties come from a third-party site over the network, so they load when
  // the panel is first opened rather than on every visit to the fund page.
  const [properties, setProperties] = useState({
    status: "idle",
    data: [],
    unavailable: null,
  });

  const load = () =>
    Promise.all([
      fetchHoldings(),
      fetchBreakdown(code).then(
        (b) => {
          setUnvaluedMessage(null);
          return b;
        },
        (err) => {
          if (err?.response?.status === 422) {
            setUnvaluedMessage(
              err.response.data?.message ||
                "This fund has no published unit value.",
            );
            return null;
          }
          throw err;
        },
      ),
      fetchHoldingDistributions(code),
      fetchHoldingFees(code),
    ]).then(([list, b, d, f]) => {
      setHolding(list.find((h) => h.fundCode === code) ?? null);
      setBreakdown(b);
      setDistributions(d);
      setFees(f);
    });

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load this fund."),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Reset on navigation between funds, or the previous fund's properties would
  // show under the new one until its own fetch resolved.
  useEffect(() => {
    setProperties({ status: "idle", data: [], unavailable: null });
  }, [code]);

  useEffect(() => {
    if (panel !== "holdings" || properties.status !== "idle") return;

    let cancelled = false;
    setProperties((p) => ({ ...p, status: "loading" }));

    fetchHoldingProperties(code)
      .then(({ data, unavailable }) => {
        if (!cancelled) setProperties({ status: "done", data, unavailable });
      })
      .catch(() => {
        if (!cancelled) {
          setProperties({
            status: "done",
            data: [],
            unavailable: "source_unreachable",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [panel, code, properties.status]);

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading fund…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!holding) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#6b7280]">
          You don&rsquo;t hold a fund with the code {code}.
        </p>
      </div>
    );
  }

  const feeRate =
    fees.aumRatePct != null ? `${fees.aumRatePct.toFixed(2)}% AUM` : "—";

  return (
    <div className="space-y-5">
      {/* 45/55 rather than even: the left column holds fixed-width tiles and the
          right holds a table, so the extra room is worth more on the right. */}
      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-[45fr_55fr]">
        <div className="min-w-0 space-y-4">
          <section className="min-w-0 rounded-[12px] border border-black/10 bg-white p-4 md:p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
            <div className="flex items-start gap-4">
              {/* The mark is already white-on-black, so it needs no inverting
                  here and the tile's own black simply continues it. */}
              <span className="grid h-12 w-12 shrink-0 overflow-hidden rounded-[14px] bg-black md:h-14 md:w-14">
                <img
                  src="/assets/AP.png"
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <h1 className="font-display text-[22px] leading-tight text-[#111111] md:text-[28px]">
                  {holding.fundName}
                </h1>
                {holding.tagline ? (
                  <p className="mt-0.5 text-[13px] text-[#64748b] md:text-[14px]">
                    {holding.tagline}
                  </p>
                ) : null}
              </div>
            </div>

            {breakdown ? (
              <div className="mt-5 rounded-[12px] border border-black/10">
                <MetricStrip
                  metrics={portfolioMetrics(breakdown.totals, {
                    // The entry-price disclosure moves off the card and onto the
                    // figure it qualifies, so it stops competing with the
                    // attribute rows for the same space.
                    currentValueNote: <PremiumNote holding={holding} />,
                  })}
                />
              </div>
            ) : (
              <div className="mt-5">
                <Unvalued
                  message={unvaluedMessage}
                  fundName={holding.fundName}
                />
              </div>
            )}

            <div className="mt-4 rounded-[12px] border border-black/10 px-4">
              <AttributeRows fund={holding} />
            </div>
          </section>

          <div className="grid auto-rows-[80px] grid-cols-2 items-stretch gap-2 md:auto-rows-[100px] md:grid-cols-4 md:gap-3">
            <ActionTile
              icon={Plus}
              label="Add Capital"
              sub="Invest more"
              primary
              active={panel === "invest"}
              onClick={() => setPanel("invest")}
            />
            <ActionTile
              icon={TrendingUp}
              label="View Holdings"
              sub={
                properties.status === "done" && !properties.unavailable
                  ? `${properties.data.length} ${
                      properties.data.length === 1 ? "property" : "properties"
                    }`
                  : "–"
              }
              active={panel === "holdings"}
              onClick={() => setPanel("holdings")}
            />
            <ActionTile
              icon={DollarSign}
              label="Distributions"
              sub={`${formatCurrency(distributions.total)} total`}
              active={panel === "distributions"}
              onClick={() => setPanel("distributions")}
            />
            <ActionTile
              icon={Percent}
              label="Fees"
              sub={feeRate}
              active={panel === "fees"}
              onClick={() => setPanel("fees")}
            />
          </div>

          {panel ? (
            <section
              className={`overflow-y-auto rounded-[12px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)] ${
                // Property cards carry photos, so the taller cap stops the
                // panel becoming a keyhole. The other panels are short field
                // lists and keep the original height.
                panel === "holdings" ? "max-h-[720px]" : "max-h-[420px]"
              }`}
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="text-[13px] text-[#6b7280] transition hover:text-[#111111]"
                >
                  Close
                </button>
              </div>
              {panel === "invest" ? (
                <InvestMorePanel fundName={holding.fundName} onFunded={load} />
              ) : null}

              {panel === "holdings" ? (
                <>
                  <h3 className="font-display text-[20px] leading-tight text-[#111111]">
                    Holdings
                  </h3>
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    The properties held by {holding.fundName}.
                  </p>

                  {properties.status !== "done" ? (
                    <p className="mt-4 text-[13px] text-[#6b7280]">
                      Loading properties…
                    </p>
                  ) : properties.unavailable ? (
                    /* Never let a broken feed read as "this fund owns nothing" —
                       an investor drawing that conclusion would be badly
                       misinformed about what backs their units. */
                    <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-black/10 bg-[#f7f5f1] p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
                      <div className="text-[13px] leading-6 text-[#1f2937]">
                        {properties.unavailable === "not_configured"
                          ? "The property feed is not connected yet, so this fund's holdings cannot be shown."
                          : "The property records could not be loaded just now. This does not affect your investment — please try again shortly."}
                      </div>
                    </div>
                  ) : properties.data.length === 0 ? (
                    <p className="mt-4 text-[13px] text-[#6b7280]">
                      No properties are recorded for this fund yet.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {properties.data.map((property, i) => (
                        <PropertyCard
                          key={property.id ?? property.address ?? i}
                          property={property}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {panel === "distributions" ? (
                <>
                  <h3 className="font-display text-[20px] leading-tight text-[#111111]">
                    Distributions — {formatCurrency(distributions.total)} total
                  </h3>
                  <div className="mt-4">
                    <MiniTable
                      head={["Date", "Amount"]}
                      rows={distributions.data.map((d) => [
                        formatDate(d.date),
                        formatCurrencyDetailed(d.amount),
                      ])}
                      empty="No distributions have been paid yet."
                    />
                  </div>
                </>
              ) : null}

              {panel === "fees" ? (
                <>
                  <h3 className="font-display text-[20px] leading-tight text-[#111111]">
                    Fees
                  </h3>

                  {/* The fund publishes a unit price already net of all fund expenses
                    and fees, so the returns above are net too. Saying so is not
                    decoration: without it these figures read as a charge still to
                    come, and an investor subtracting them again would understate
                    their own position. */}
                  <div className="mt-3 flex items-start gap-3 rounded-[14px] border border-black/10 bg-[#f7f5f1] p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
                    <div className="text-[13px] leading-6 text-[#1f2937]">
                      <p>
                        <strong>
                          These figures are for transparency only.
                        </strong>{" "}
                        Fees are charged at fund level and paid by the fund.
                      </p>
                      {fees.alreadyNetOfFees ? (
                        <p className="mt-1.5 text-[#4b5563]">
                          The unit price your position is valued at is already
                          net of all fund expenses and fees, so your returns
                          above are also net. Do not subtract the amounts below
                          again — they are already reflected.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-5 sm:grid-cols-3">
                    <Field
                      label="Rate"
                      value={
                        fees.aumRatePct != null
                          ? `${fees.aumRatePct.toFixed(2)}% per year`
                          : "—"
                      }
                      hint="of gross asset value, charged quarterly"
                    />
                    <Field
                      label="Your AUM fees to date"
                      value={formatCurrencyDetailed(fees.totalAum)}
                      hint={`${fees.aum?.length ?? 0} period${(fees.aum?.length ?? 0) === 1 ? "" : "s"}`}
                    />
                    <Field
                      label="Your performance fees to date"
                      value={formatCurrencyDetailed(fees.totalPerformance)}
                    />
                  </dl>

                  {/* Each period shows the fund's total and the share it was split
                    by, so the investor's own figure can be checked rather than
                    taken on trust. */}
                  <div className="mt-4">
                    <MiniTable
                      head={["Period", "Fund total", "Your share", "Your fee"]}
                      rows={(fees.aum || []).map((r) => [
                        `${r.periodStart} → ${r.periodEnd}`,
                        r.fundTotal != null
                          ? formatCurrencyDetailed(r.fundTotal)
                          : "—",
                        r.ownershipPct != null
                          ? `${r.ownershipPct.toFixed(3)}%`
                          : "—",
                        formatCurrencyDetailed(r.amount),
                      ])}
                      empty="No AUM fees have been allocated yet."
                    />
                  </div>
                </>
              ) : null}
            </section>
          ) : null}
        </div>

        <div className="min-w-0 space-y-4">
          <NavHistoryChart fundCode={code} />
          {breakdown && breakdown.rows.length > 0 ? (
            <InvestmentHistoryTable
              rows={breakdown.rows}
              totals={breakdown.totals}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, hint }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[#9ca3af]">{hint}</p>
      ) : null}
    </div>
  );
}

export default FundDetailPage;
