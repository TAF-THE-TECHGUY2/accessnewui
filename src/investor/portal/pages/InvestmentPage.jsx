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
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  fetchHoldingDistributions,
  fetchHoldingFees,
  fetchHoldingPerformance,
  fetchHoldingPriceHistory,
  fetchHoldings,
  fetchPortfolio,
} from "../../../services/investorPortalService";

const RANGES = ["1M", "3M", "6M", "1Y", "All"];

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

      <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField label="Amount invested" value={formatCurrency(holding.amountInvested)} />
        <DetailField label="Current unit price" value={`$${holding.currentUnitPrice.toFixed(4)}`} />
        <DetailField label="Total units held" value={holding.totalUnits.toFixed(2)} />
        <DetailField label="Current value" value={formatCurrency(holding.currentValue)} />
        <DetailField
          label="Gain / Loss"
          value={`${formatCurrency(holding.gainLoss)} (${formatPercent(holding.gainLossPct)})`}
          positive={holding.gainLoss >= 0}
        />
        <DetailField label="Total return" value={formatPercent(holding.totalReturnPct)} positive={holding.totalReturnPct >= 0} />
        <DetailField label="Annualized return" value={formatPercent(holding.annualizedReturnPct)} positive={holding.annualizedReturnPct >= 0} />
        <DetailField label="Total distributions" value={formatCurrency(holding.totalDistributions)} />
      </dl>

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
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FeeBlock title="AUM fees" total={fees.totalAum} rows={fees.aum} empty="No AUM fees yet" />
          <FeeBlock title="Performance fees" total={fees.totalPerformance} rows={fees.performance} empty="No performance fees yet" />
        </div>
      </details>
    </article>
  );
}

function DetailField({ label, value, positive }) {
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
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPortfolio(), fetchHoldings()])
      .then(([p, h]) => {
        setPortfolio(p);
        setHoldings(h);
      })
      .finally(() => setLoading(false));
  }, []);

  const primaryFund = useMemo(() => holdings[0], [holdings]);

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading portfolio…</p>;
  }

  if (!portfolio || holdings.length === 0) {
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
      <section>
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Total investment
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Across all funds you have a position in.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total invested" value={formatCurrency(portfolio.totalInvested)} />
          <StatCard
            label="Current value"
            value={formatCurrency(portfolio.totalCurrentValue)}
            sub={formatPercent(portfolio.totalGainLossPct)}
            trend={portfolio.totalGainLossPct}
          />
          <StatCard
            label="Gain / Loss"
            value={formatCurrency(portfolio.totalGainLoss)}
            sub={`vs. invested`}
            trend={portfolio.totalGainLoss}
          />
          <StatCard
            label="Total return"
            value={formatPercent(portfolio.totalReturnPct)}
            sub={`incl. ${formatCurrency(portfolio.totalDistributions)} distributions`}
            trend={portfolio.totalReturnPct}
          />
        </div>
      </section>

      {primaryFund ? <PerformanceChart fundCode={primaryFund.fundCode} /> : null}

      <section className="space-y-4">
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Investment composition
        </h2>
        {holdings.map((h) => (
          <HoldingDetail key={h.fundCode} holding={h} />
        ))}
      </section>
    </div>
  );
}

export default InvestmentPage;
