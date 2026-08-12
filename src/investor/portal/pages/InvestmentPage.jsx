import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  fetchBreakdown,
  fetchHoldingDistributions,
  fetchHoldingFees,
  fetchHoldingPerformance,
  fetchHoldingPriceHistory,
  fetchHoldings,
} from "../../../services/investorPortalService";

import StripeFundingPanel from "../../components/StripeFundingPanel";

const RANGES = ["1M", "3M", "6M", "1Y", "All"];

/**
 * Additional subscription into a fund the investor already holds.
 *
 * Two steps on purpose: the amount is captured first, then handed to the Stripe
 * panel. Nothing is created server-side until an amount is submitted, so simply
 * viewing this tab never mints a PaymentIntent.
 */
function InvestMorePanel({ holding, onFunded }) {
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
      className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_14px_28px_rgba(17,24,39,0.08)]"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
        Add to your position
      </p>
      <h3 className="font-display mt-1 text-[22px] leading-tight text-[#111111]">
        Invest more in {holding.fundName}
      </h3>
      <p className="mt-2 text-sm text-[#4b5563]">
        New units are issued at the fund&rsquo;s current book value on the day your
        payment settles, not at today&rsquo;s price.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
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
            className="h-12 w-56 rounded-[14px] border border-black/10 pl-7 pr-3 text-sm outline-none focus:border-teal-600"
          />
        </div>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-12 items-center rounded-[14px] bg-black px-6 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatCurrencyDetailed = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount ?? 0);

const formatPercent = (value) =>
  `${(value ?? 0) >= 0 ? "+" : ""}${(value ?? 0).toFixed(2)}%`;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

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
function PremiumNotice({ holding }) {
  // null is not zero. The API sends null when any deposit has no published book
  // value to compare against, and treating that as 0 is what fabricated a
  // "$7.90 book value plus a 26.8% entry premium" against a real $10.01 entry.
  if (holding.premiumPaid == null || holding.entryBookValue == null) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-black/10 bg-[#f7f5f1] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
        <div className="text-[13px] leading-6 text-[#1f2937]">
          <p>
            You entered at{" "}
            <strong>
              ${holding.entryPrice != null ? holding.entryPrice.toFixed(4) : "—"}
            </strong>{" "}
            per unit.
          </p>
          <p className="mt-1.5 text-[#4b5563]">
            One or more of your deposits has no published book value for its
            date, so there is no book value to compare that entry price against.
            Your units, contributions and current value above are unaffected.
          </p>
        </div>
      </div>
    );
  }

  const premiumPaid = holding.premiumPaid;

  if (premiumPaid <= 0) {
    return null;
  }

  const stillRecovering = holding.gainLoss < 0;

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-[14px] border p-4 ${
        stillRecovering
          ? "border-amber-200 bg-amber-50"
          : "border-black/10 bg-[#f7f5f1]"
      }`}
    >
      <Info
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          stillRecovering ? "text-amber-700" : "text-[#6b7280]"
        }`}
      />
      <div className="text-[13px] leading-6 text-[#1f2937]">
        <p>
          You entered at{" "}
          <strong>${(holding.entryPrice ?? 0).toFixed(2)}</strong> per unit — the{" "}
          <strong>${holding.entryBookValue.toFixed(2)}</strong> book value plus a{" "}
          <strong>{(holding.premiumPct ?? 0).toFixed(1)}% entry premium</strong>{" "}
          of {formatCurrencyDetailed(premiumPaid)}.
        </p>
        {stillRecovering ? (
          <p className="mt-1.5 text-[#4b5563]">
            Your position shows a paper loss because the premium is not yet
            recovered. This is expected — the premium reflects entering an
            established portfolio, and is typically recovered through
            appreciation and distributions.
          </p>
        ) : (
          <p className="mt-1.5 text-[#4b5563]">
            That premium has been recovered — your position is above what you
            paid.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * AUM fee disclosure. Annex 3 requires three figures, not one: the rate, the
 * amount charged for the most recent period, and the cumulative total to date.
 */
function AumFeeDisclosure({ fees }) {
  const rate = fees.aumRatePct;
  const period = fees.aumCurrentPeriod;

  if (rate == null) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3 rounded-[14px] border border-black/10 bg-white p-4 sm:grid-cols-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
          Rate
        </p>
        <p className="mt-1 text-[15px] text-[#111111]">
          {rate.toFixed(2)}% per year
        </p>
        <p className="mt-0.5 text-[11px] text-[#9ca3af]">charged quarterly</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
          This period
        </p>
        <p className="mt-1 text-[15px] text-[#111111]">
          {period ? formatCurrencyDetailed(period.amount) : "—"}
        </p>
        <p className="mt-0.5 text-[11px] text-[#9ca3af]">
          {period
            ? `${formatDate(period.periodStart)} – ${formatDate(period.periodEnd)}`
            : "no fees charged yet"}
        </p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
          Total to date
        </p>
        <p className="mt-1 text-[15px] text-[#111111]">
          {formatCurrencyDetailed(fees.totalAum)}
        </p>
        <p className="mt-0.5 text-[11px] text-[#9ca3af]">
          {fees.aum?.length ?? 0} period{(fees.aum?.length ?? 0) === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

/**
 * Fund switcher. Only rendered when the investor holds more than one fund —
 * a dropdown with a single option is noise.
 */
function FundSelector({ holdings, activeCode, onChange }) {
  if (holdings.length < 2) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor="fund-selector"
        className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]"
      >
        Fund
      </label>
      <div className="relative">
        <select
          id="fund-selector"
          value={activeCode}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 appearance-none rounded-[12px] border border-black/15 bg-white pl-4 pr-10 text-[14px] text-[#111111] outline-none focus:border-[#111111]"
        >
          {holdings.map((h) => (
            <option key={h.fundCode} value={h.fundCode}>
              {h.fundName}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, trend }) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </p>
      <p className="font-display mt-2 text-[28px] leading-none text-[#111111]">
        {value}
      </p>
      {sub != null ? (
        <p
          className={`mt-2 inline-flex items-center gap-1 text-[12px] font-medium ${
            isPositive ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {sub}
        </p>
      ) : null}
    </div>
  );
}


const formatUnits = (v) =>
  (v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 6 });

const formatPrice = (v) =>
  v == null
    ? "—"
    : `$${(v).toLocaleString("en-US", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })}`;

/**
 * Shown when the fund has no published unit value.
 *
 * A position cannot be valued without one, and the alternative — falling back to
 * what the investor paid — presents cost basis as market value and reports a
 * gain of exactly zero. That was a reported bug. Saying so plainly is the only
 * honest option.
 */
function Unvalued({ message }) {
  return (
    <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h3 className="text-[15px] font-semibold text-amber-900">
            Your position cannot be valued yet
          </h3>
          <p className="mt-1.5 text-[13px] leading-6 text-amber-800">
            {message ||
              "No unit value has been published for this fund, so current value, gain and return cannot be calculated."}
          </p>
          <p className="mt-2 text-[13px] leading-6 text-amber-800">
            Your contributions and unit holdings below are unaffected. Valuation
            figures will appear once the fund publishes a unit value.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Per-investment table. Every column is computed to the fund manager's formulas:
 * unit price is contribution / units, holding period runs from the deposit date
 * to the unit value's as-of date over 365.25 days, and the annualized figure is
 * (1 + gain%)^(1/years) - 1.
 */
function BreakdownTable({ rows, totals }) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-black/10 bg-white">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-[#f5f5f5] text-[11px] uppercase tracking-[0.1em] text-[#6b7280]">
          <tr>
            <th className="px-4 py-3 text-left">Deposit date</th>
            <th className="px-4 py-3 text-right">Contribution</th>
            <th className="px-4 py-3 text-right">%</th>
            <th className="px-4 py-3 text-right">Units</th>
            <th className="px-4 py-3 text-right">Unit price</th>
            <th className="px-4 py-3 text-right">Current value</th>
            <th className="px-4 py-3 text-right">Gain / Loss</th>
            <th className="px-4 py-3 text-right">Gain %</th>
            <th className="px-4 py-3 text-right">Years held</th>
            <th className="px-4 py-3 text-right">Annualized</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.transactionId} className="border-t border-black/5">
              <td className="px-4 py-3 text-ink">
                {r.depositDate}
                {r.dateOaMipaSigned ? (
                  <span className="block text-[11px] text-[#9ca3af]">
                    signed {r.dateOaMipaSigned}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {formatCurrencyDetailed(r.contribution)}
              </td>
              <td className="px-4 py-3 text-right text-[#6b7280]">
                {r.contributionPct.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {formatUnits(r.units)}
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {formatPrice(r.unitPrice)}
              </td>
              <td className="px-4 py-3 text-right text-ink">
                {formatCurrencyDetailed(r.unitsValue)}
              </td>
              <td
                className={`px-4 py-3 text-right font-medium ${
                  r.gain >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCurrencyDetailed(r.gain)}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  r.gainPct >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatPercent(r.gainPct)}
              </td>
              <td className="px-4 py-3 text-right text-[#6b7280]">
                {r.holdingYears.toFixed(4)}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  r.annualizedReturnPct >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {formatPercent(r.annualizedReturnPct)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-black/10 bg-[#fafafa] font-semibold">
          <tr>
            <td className="px-4 py-3 text-ink">
              Total
              <span className="block text-[11px] font-normal text-[#9ca3af]">
                {totals.investmentCount} investment
                {totals.investmentCount === 1 ? "" : "s"}
              </span>
            </td>
            <td className="px-4 py-3 text-right text-ink">
              {formatCurrencyDetailed(totals.contribution)}
            </td>
            <td className="px-4 py-3 text-right text-[#6b7280]">100.00%</td>
            <td className="px-4 py-3 text-right text-ink">
              {formatUnits(totals.units)}
            </td>
            <td className="px-4 py-3 text-right text-ink">
              {formatPrice(totals.weightedAverageUnitPrice)}
              <span className="block text-[11px] font-normal text-[#9ca3af]">
                weighted avg
              </span>
            </td>
            <td className="px-4 py-3 text-right text-ink">
              {formatCurrencyDetailed(totals.unitsValue)}
            </td>
            <td
              className={`px-4 py-3 text-right ${
                totals.gain >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {formatCurrencyDetailed(totals.gain)}
            </td>
            <td
              className={`px-4 py-3 text-right ${
                totals.gainPct >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {formatPercent(totals.gainPct)}
            </td>
            <td className="px-4 py-3 text-right text-[#6b7280]">
              {totals.weightedAverageHoldingPeriodYears.toFixed(4)}
              <span className="block text-[11px] font-normal text-[#9ca3af]">
                units-weighted
              </span>
            </td>
            <td
              className={`px-4 py-3 text-right ${
                totals.annualizedReturnPct >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {formatPercent(totals.annualizedReturnPct)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PerformanceChart({ fundCode }) {
  const [range, setRange] = useState("1Y");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetchHoldingPerformance(fundCode, range)
      .then((data) => {
        if (!cancel) setPoints(data.points || []);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [fundCode, range]);

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
            Performance
          </p>
          <h3 className="font-display mt-1 text-[20px] leading-tight text-[#111111]">
            Portfolio value over time
          </h3>
        </div>
        <div className="flex gap-1 rounded-[12px] bg-[#f5f5f5] p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-[10px] px-3 py-1.5 text-xs font-medium transition ${
                range === r
                  ? "bg-black text-white"
                  : "text-[#6b7280] hover:text-[#1f2937]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[260px]">
        {loading ? (
          <p className="grid h-full place-items-center text-sm text-[#6b7280]">
            Loading…
          </p>
        ) : points.length === 0 ? (
          <p className="grid h-full place-items-center text-sm text-[#6b7280]">
            No price points in this range.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f3d3e" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0f3d3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
                formatter={(v) => formatCurrencyDetailed(v)}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0f3d3e"
                strokeWidth={2}
                fill="url(#chartGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function HoldingDetail({ holding }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const [distributions, setDistributions] = useState({ data: [], total: 0 });
  const [fees, setFees] = useState({ aum: [], performance: [], totalAum: 0, totalPerformance: 0 });

  useEffect(() => {
    fetchHoldingPriceHistory(holding.fundCode).then(setPriceHistory);
    fetchHoldingDistributions(holding.fundCode).then(setDistributions);
    fetchHoldingFees(holding.fundCode).then(setFees);
  }, [holding.fundCode]);

  return (
    <article className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
            {holding.fundType} · {holding.targetYield}
          </p>
          <h3 className="font-display mt-1 text-[22px] leading-tight text-[#111111]">
            {holding.fundName}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
            % of portfolio
          </p>
          <p className="font-display mt-1 text-[20px] text-[#111111]">
            {holding.percentOfPortfolio.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Only what the breakdown table above does not already carry. Every
          figure duplicated here previously came from the older per-holding math
          and disagreed with it — the same position showed +8.94% in the table
          and +8.27% here. One number per question. */}
      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField
          label="Current unit price"
          value={`$${holding.currentUnitPrice.toFixed(4)}`}
          hint="published book value"
        />
        <DetailField
          label="Units held"
          value={holding.totalUnits.toLocaleString("en-US", { maximumFractionDigits: 6 })}
        />
        <DetailField
          label="Total distributions"
          value={formatCurrency(holding.totalDistributions)}
        />
        <DetailField
          label="First invested"
          value={formatDate(holding.firstTransactionDate)}
          hint={
            holding.transactionCount > 1
              ? `${holding.transactionCount} investments`
              : undefined
          }
        />
      </dl>

      <PremiumNotice holding={holding} />

      <details className="mt-6 group">
        <summary className="cursor-pointer text-sm font-medium text-[#0f3d3e]">
          Price history (quarterly)
        </summary>
        <div className="mt-3 overflow-hidden rounded-[12px] border border-black/10">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f5f5] text-[11px] uppercase tracking-[0.12em] text-[#6b7280]">
              <tr>
                <th className="px-4 py-2 text-left">Quarter</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {priceHistory.map((p, idx) => (
                <tr key={idx} className="border-t border-black/5">
                  <td className="px-4 py-2 text-ink">{p.quarter}</td>
                  <td className="px-4 py-2 text-[#6b7280]">{p.date}</td>
                  <td className="px-4 py-2 text-right text-ink">${p.price.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details className="mt-4 group">
        <summary className="cursor-pointer text-sm font-medium text-[#0f3d3e]">
          Distributions — {formatCurrency(distributions.total)} total
        </summary>
        <div className="mt-3 overflow-hidden rounded-[12px] border border-black/10">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f5f5] text-[11px] uppercase tracking-[0.12em] text-[#6b7280]">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {distributions.data.map((d, idx) => (
                <tr key={idx} className="border-t border-black/5">
                  <td className="px-4 py-2 text-[#6b7280]">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right text-ink">{formatCurrencyDetailed(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-[#0f3d3e]">
          Fees — AUM {formatCurrency(fees.totalAum)} / Performance {formatCurrency(fees.totalPerformance)}
        </summary>

        <AumFeeDisclosure fees={fees} />

        <p className="mt-3 text-[12px] leading-5 text-[#6b7280]">
          Fees are charged at fund level and paid by the fund. The figures above
          are your attributable share, not a separate charge to you.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FeeBlock title="AUM fees" total={fees.totalAum} rows={fees.aum} empty="No AUM fees yet" />
          <FeeBlock title="Performance fees" total={fees.totalPerformance} rows={fees.performance} empty="No performance fees yet" />
        </div>
      </details>
    </article>
  );
}

function DetailField({ label, value, positive, hint }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-medium ${
          positive === undefined
            ? "text-ink"
            : positive
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {value}
      </dd>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[#9ca3af]">{hint}</p>
      ) : null}
    </div>
  );
}

function FeeBlock({ title, total, rows, empty }) {
  return (
    <div className="rounded-[12px] border border-black/10 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">{title}</p>
      <p className="font-display mt-1 text-[18px] text-[#111111]">
        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total ?? 0)}
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-[#9ca3af]">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1 text-xs text-[#6b7280]">
          {rows.slice(0, 4).map((r, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{r.periodStart} → {r.periodEnd}</span>
              <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.amount)}</span>
            </li>
          ))}
          {rows.length > 4 ? (
            <li className="text-[#9ca3af]">+ {rows.length - 4} more periods</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function InvestmentPage() {
  const [breakdown, setBreakdown] = useState(null);
  const [unvaluedMessage, setUnvaluedMessage] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFundCode, setActiveFundCode] = useState(null);

  // Every displayed figure comes from /portal/breakdown, which computes to the
  // fund manager's formulas. holdings() is still fetched, but only for the fund
  // selector and the per-fund detail panels — never for the headline numbers,
  // which used different math and were reported as wrong.
  const load = (fundCode) =>
    Promise.all([
      fetchBreakdown(fundCode).then(
        (b) => {
          setUnvaluedMessage(null);
          return b;
        },
        (err) => {
          // 422 means the fund has no published unit value. That is a real
          // state, not a failure — surface it instead of rendering zeros.
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
      fetchHoldings(),
    ]).then(([b, h]) => {
      setBreakdown(b);
      setHoldings(h);
      setActiveFundCode((curr) => curr ?? h[0]?.fundCode ?? null);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  // The selector scopes the chart and composition below it. The totals panel
  // stays global — Annex 3 defines "% of Total Portfolio" against all funds, so
  // it cannot be scoped to one without changing its meaning.
  const activeHolding = useMemo(
    () => holdings.find((h) => h.fundCode === activeFundCode) ?? holdings[0],
    [holdings, activeFundCode],
  );

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading portfolio…</p>;
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center">
        <p className="text-sm text-[#6b7280]">
          You don't have any holdings yet. Once your investment is active, it'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unvaluedMessage ? <Unvalued message={unvaluedMessage} /> : null}

      {breakdown ? (
        <section>
          <h2 className="font-display text-[24px] leading-tight text-[#111111]">
            Total investment
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Valued at {formatPrice(breakdown.totals.unitValue)} per unit as of{" "}
            {breakdown.totals.unitValueAsOf}. All figures are measured to that
            date.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total invested"
              value={formatCurrencyDetailed(breakdown.totals.contribution)}
              sub={`${formatUnits(breakdown.totals.units)} units`}
              trend={0}
            />
            <StatCard
              label="Current value"
              value={formatCurrencyDetailed(breakdown.totals.unitsValue)}
              sub={formatPercent(breakdown.totals.gainPct)}
              trend={breakdown.totals.gainPct}
            />
            <StatCard
              label="Gain / Loss"
              value={formatCurrencyDetailed(breakdown.totals.gain)}
              sub="vs. invested"
              trend={breakdown.totals.gain}
            />
            <StatCard
              label="Annualized return"
              value={formatPercent(breakdown.totals.annualizedReturnPct)}
              sub={`over ${breakdown.totals.weightedAverageHoldingPeriodYears.toFixed(2)} yrs held`}
              trend={breakdown.totals.annualizedReturnPct}
            />
          </div>
        </section>
      ) : null}

      {breakdown && breakdown.rows.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-[24px] leading-tight text-[#111111]">
              Your investments
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Each contribution, the units it bought, and how it has performed
              since the deposit date.
            </p>
          </div>
          <BreakdownTable
            rows={breakdown.rows}
            totals={breakdown.totals}
          />
          <p className="text-[12px] leading-5 text-[#6b7280]">
            Unit price is your contribution divided by the units it purchased.
            Holding periods run from the deposit date to{" "}
            {breakdown.totals.unitValueAsOf} using a 365.25-day year. The
            weighted average holding period is weighted by units held.
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[24px] leading-tight text-[#111111]">
              Fund detail
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              {holdings.length > 1
                ? "Select a fund to see its performance and detail."
                : "Your position in this fund."}
            </p>
          </div>
          <FundSelector
            holdings={holdings}
            activeCode={activeHolding?.fundCode}
            onChange={setActiveFundCode}
          />
        </div>

        {activeHolding ? (
          <>
            <PerformanceChart fundCode={activeHolding.fundCode} />
            <HoldingDetail holding={activeHolding} />
            <InvestMorePanel holding={activeHolding} onFunded={load} />
          </>
        ) : null}
      </section>
    </div>
  );
}

export default InvestmentPage;
