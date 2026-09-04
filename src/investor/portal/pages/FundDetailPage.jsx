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
  ArrowLeft,
  DollarSign,
  Info,
  Percent,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  fetchBreakdown,
  fetchHoldingDistributions,
  fetchHoldingFees,
  fetchHoldingPriceHistory,
  fetchHoldings,
} from "../../../services/investorPortalService";
import StripeFundingPanel from "../../components/StripeFundingPanel";
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
              $
              {holding.entryPrice != null ? holding.entryPrice.toFixed(4) : "—"}
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
          <strong>${(holding.entryPrice ?? 0).toFixed(2)}</strong> per unit —
          the <strong>${holding.entryBookValue.toFixed(2)}</strong> book value
          plus a{" "}
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
 * NAV per unit over the fund's published history.
 *
 * The fund's book value, not the investor's position — so it is drawn from the
 * published price series and carries no dependence on when anyone invested.
 */
function NavHistoryChart({ fundCode }) {
  const [points, setPoints] = useState(null);

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

  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-[22px] leading-tight text-[#111111]">
          NAV Per Unit History
        </h2>
        {latest != null ? (
          <p className="font-display text-[18px] leading-none text-[#111111]">
            {latest.toFixed(2)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 h-[300px]">
        {points == null ? (
          <p className="grid h-full place-items-center text-sm text-[#6b7280]">
            Loading…
          </p>
        ) : data.length === 0 ? (
          <p className="grid h-full place-items-center text-sm text-[#6b7280]">
            No unit values published yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
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
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => v.toFixed(1)}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
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
                // Only the newest point is marked; a dot on every quarter turns
                // the series into a scatter and hides the shape.
                dot={false}
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
function InvestmentHistoryTable({ rows, totals }) {
  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <h2 className="font-display text-[22px] leading-tight text-[#111111]">
        Investment History
      </h2>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm tabular-nums">
          <thead className="text-[11px] uppercase tracking-[0.08em] text-[#64748b]">
            <tr className="border-b border-black/10">
              <th className="px-2 py-3 text-left font-medium">Deposit Date</th>
              <th className="px-2 py-3 text-right font-medium">
                Amount Invested
              </th>
              <th className="px-2 py-3 text-right font-medium">%</th>
              <th className="px-2 py-3 text-right font-medium">Units Held</th>
              <th className="px-2 py-3 text-right font-medium">
                Purchase Price
              </th>
              <th className="px-2 py-3 text-right font-medium">
                Current Value
              </th>
              <th className="px-2 py-3 text-right font-medium">Total Return</th>
              <th className="px-2 py-3 text-right font-medium">Years Held</th>
              <th className="px-2 py-3 text-right font-medium">Annualized</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.transactionId} className="border-b border-black/5">
                <td className="px-2 py-4 text-left text-[#111111]">
                  {r.depositDate}
                  {r.dateOaMipaSigned ? (
                    <span className="block text-[11px] text-[#9ca3af]">
                      signed {r.dateOaMipaSigned}
                    </span>
                  ) : null}
                </td>
                <td className="px-2 py-4 text-right text-[#111111]">
                  {formatCurrencyDetailed(r.contribution)}
                </td>
                <td className="px-2 py-4 text-right text-[#64748b]">
                  {r.contributionPct.toFixed(2)}%
                </td>
                <td className="px-2 py-4 text-right text-[#111111]">
                  {formatUnits(r.units)}
                </td>
                <td className="px-2 py-4 text-right text-[#111111]">
                  {formatPrice(r.unitPrice)}
                </td>
                <td className="px-2 py-4 text-right text-[#111111]">
                  {formatCurrencyDetailed(r.unitsValue)}
                </td>
                <td className="px-2 py-4 text-right">
                  <span
                    className="block font-medium"
                    style={{ color: gainColor(r.gain) }}
                  >
                    {r.gain >= 0 ? "+" : ""}
                    {formatCurrencyDetailed(r.gain)}
                  </span>
                  <span
                    className="block text-[12px]"
                    style={{ color: gainColor(r.gainPct) }}
                  >
                    {formatPercent(r.gainPct)}
                  </span>
                </td>
                <td className="px-2 py-4 text-right text-[#64748b]">
                  {r.holdingYears.toFixed(4)}
                </td>
                <td
                  className="px-2 py-4 text-right"
                  style={{ color: gainColor(r.annualizedReturnPct) }}
                >
                  {formatPercent(r.annualizedReturnPct)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-semibold">
            <tr>
              <td className="px-2 py-4 text-left text-[#111111]">
                Total
                <span className="block text-[11px] font-normal text-[#9ca3af]">
                  {totals.investmentCount} investment
                  {totals.investmentCount === 1 ? "" : "s"}
                </span>
              </td>
              <td className="px-2 py-4 text-right text-[#111111]">
                {formatCurrencyDetailed(totals.contribution)}
              </td>
              <td className="px-2 py-4 text-right text-[#64748b]">100.00%</td>
              <td className="px-2 py-4 text-right text-[#111111]">
                {formatUnits(totals.units)}
              </td>
              <td className="px-2 py-4 text-right text-[#111111]">
                {formatPrice(totals.weightedAverageUnitPrice)}
                <span className="block text-[11px] font-normal text-[#9ca3af]">
                  weighted avg
                </span>
              </td>
              <td className="px-2 py-4 text-right text-[#111111]">
                {formatCurrencyDetailed(totals.unitsValue)}
              </td>
              <td className="px-2 py-4 text-right">
                <span
                  className="block"
                  style={{ color: gainColor(totals.gain) }}
                >
                  {totals.gain >= 0 ? "+" : ""}
                  {formatCurrencyDetailed(totals.gain)}
                </span>
                <span
                  className="block text-[12px]"
                  style={{ color: gainColor(totals.gainPct) }}
                >
                  {formatPercent(totals.gainPct)}
                </span>
              </td>
              <td className="px-2 py-4 text-right text-[#64748b]">
                {totals.weightedAverageHoldingPeriodYears.toFixed(4)}
                <span className="block text-[11px] font-normal text-[#9ca3af]">
                  units-weighted
                </span>
              </td>
              <td
                className="px-2 py-4 text-right"
                style={{ color: gainColor(totals.annualizedReturnPct) }}
              >
                {formatPercent(totals.annualizedReturnPct)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-4 text-[12px] leading-5 text-[#6b7280]">
        Purchase price is your contribution divided by the units it bought.
        Holding periods run from the deposit date to {totals.unitValueAsOf}{" "}
        using a 365.25-day year. The weighted average holding period is weighted
        by units held.
      </p>
    </section>
  );
}

function ActionTile({ icon: Icon, label, sub, active, primary, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 rounded-[18px] border px-3 py-5 text-center transition ${
        primary
          ? "border-black bg-black text-white hover:bg-[#1f2937]"
          : active
            ? "border-black/40 bg-white text-[#111111]"
            : "border-black/10 bg-white text-[#111111] hover:border-black/30"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full border ${
          primary ? "border-white/40" : "border-black/15"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="text-[13px] font-medium">{label}</span>
      <span
        className={`text-[12px] ${primary ? "text-white/70" : "text-[#9ca3af]"}`}
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
  const [panel, setPanel] = useState("holdings");

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

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading fund…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!holding) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="text-sm text-[#6b7280]">
          You don&rsquo;t hold a fund with the code {code}.
        </p>
      </div>
    );
  }

  const feeRate =
    fees.aumRatePct != null ? `${fees.aumRatePct.toFixed(2)}% AUM` : "—";

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
            <div className="flex items-start gap-4">
              {/* The mark is already white-on-black, so it needs no inverting
                  here and the tile's own black simply continues it. */}
              <span className="grid h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-black">
                <img
                  src="/assets/AP.png"
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <h1 className="font-display text-[23px] leading-tight text-[#111111]">
                  {holding.fundName}
                </h1>
                {holding.tagline ? (
                  <p className="mt-1 text-[14px] text-[#64748b]">
                    {holding.tagline}
                  </p>
                ) : null}
              </div>
            </div>

            {breakdown ? (
              <div className="mt-6 overflow-hidden rounded-[16px] border border-black/10">
                <MetricStrip
                  metrics={portfolioMetrics(breakdown.totals)}
                  cols={2}
                />
              </div>
            ) : (
              <div className="mt-6">
                <Unvalued
                  message={unvaluedMessage}
                  fundName={holding.fundName}
                />
              </div>
            )}

            <div className="mt-4">
              <AttributeRows fund={holding} />
            </div>

            <PremiumNotice holding={holding} />
          </section>
        </div>

        <div className="space-y-6">
          <NavHistoryChart fundCode={code} />
          {/* Beside the chart rather than under the identity card, which is the
              taller of the two columns — under it the tiles left the right
              column half empty. */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
              sub={`${formatUnits(holding.totalUnits)} units`}
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
        </div>
      </div>

      <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        {panel === "invest" ? (
          <InvestMorePanel fundName={holding.fundName} onFunded={load} />
        ) : null}

        {panel === "holdings" ? (
          <>
            <h3 className="font-display text-[20px] leading-tight text-[#111111]">
              Your holding
            </h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field
                label="Current unit price"
                value={`$${holding.currentUnitPrice.toFixed(4)}`}
                hint="published book value"
              />
              <Field
                label="Units held"
                value={formatUnits(holding.totalUnits)}
              />
              <Field
                label="Total distributions"
                value={formatCurrency(holding.totalDistributions)}
              />
              <Field
                label="First invested"
                value={formatDate(holding.firstTransactionDate)}
                hint={
                  holding.transactionCount > 1
                    ? `${holding.transactionCount} investments`
                    : undefined
                }
              />
              <Field
                label="% of portfolio"
                value={`${holding.percentOfPortfolio.toFixed(1)}%`}
              />
              <Field label="Target yield" value={holding.targetYield || "—"} />
            </dl>
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
                  <strong>These figures are for transparency only.</strong> Fees
                  are charged at fund level and paid by the fund.
                </p>
                {fees.alreadyNetOfFees ? (
                  <p className="mt-1.5 text-[#4b5563]">
                    The unit price your position is valued at is already net of
                    all fund expenses and fees, so your returns above are also
                    net. Do not subtract the amounts below again — they are
                    already reflected.
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
                  r.fundTotal != null ? formatCurrencyDetailed(r.fundTotal) : "—",
                  r.ownershipPct != null ? `${r.ownershipPct.toFixed(3)}%` : "—",
                  formatCurrencyDetailed(r.amount),
                ])}
                empty="No AUM fees have been allocated yet."
              />
            </div>
          </>
        ) : null}
      </section>

      {/* Full width rather than beside the chart as the reference design has
          it: nine columns inside a 60% column clipped the last three behind a
          horizontal scrollbar, and these are the figures being reconciled. */}
      {breakdown && breakdown.rows.length > 0 ? (
        <InvestmentHistoryTable
          rows={breakdown.rows}
          totals={breakdown.totals}
        />
      ) : null}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] transition hover:text-[#111111]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to your funds
    </Link>
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
