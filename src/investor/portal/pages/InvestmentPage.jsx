import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  DollarSign,
  PieChart,
  Users,
} from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import {
  fetchBreakdown,
  fetchHoldings,
} from "../../../services/investorPortalService";
import {
  AttributeRows,
  FundGlyph,
  MetricStrip,
  portfolioMetrics,
} from "../components/PortalPrimitives";
import {
  formatCurrencyDetailed,
  formatDateNumeric,
  formatPercent,
  formatSignedCurrency,
  formatUnitsFixed,
  gainColor,
} from "../lib/format";

/**
 * Shown when a fund has no published unit value.
 *
 * A position cannot be valued without one, and the alternative — falling back
 * to what the investor paid — presents cost basis as market value and reports a
 * gain of exactly zero. That was a reported bug. Saying so plainly is the only
 * honest option.
 */
export function Unvalued({ message, fundName }) {
  return (
    <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h3 className="text-[15px] font-semibold text-amber-900">
            {fundName ? `${fundName} cannot be valued yet` : "Your position cannot be valued yet"}
          </h3>
          <p className="mt-1.5 text-[13px] leading-6 text-amber-800">
            {message ||
              "No unit value has been published for this fund, so current value, gain and return cannot be calculated."}
          </p>
          <p className="mt-2 text-[13px] leading-6 text-amber-800">
            Your contributions and unit holdings are unaffected. Valuation
            figures will appear once the fund publishes a unit value.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * One card per fund the investor holds. Its four metrics come from that fund's
 * own breakdown, not from a share of the portfolio total, so the figures match
 * what the fund's detail page shows when you follow View Details.
 */
function FundCard({ holding, breakdown, unvaluedMessage }) {
  return (
    <article className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <FundGlyph />
          <div>
            <h3 className="font-display text-[24px] leading-tight text-[#111111]">
              {holding.fundName}
            </h3>
            {holding.tagline ? (
              <p className="mt-1 text-[14px] text-[#64748b]">{holding.tagline}</p>
            ) : null}
          </div>
        </div>
        <Link
          to={`/dashboard/funds/${holding.fundCode}`}
          className="inline-flex items-center gap-2 rounded-[12px] bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1f2937]"
        >
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {breakdown ? (
        <div className="mt-6 rounded-[16px] border border-black/10">
          <MetricStrip metrics={portfolioMetrics(breakdown.totals)} />
        </div>
      ) : (
        <div className="mt-6">
          <Unvalued message={unvaluedMessage} fundName={holding.fundName} />
        </div>
      )}

      <div className="mt-2">
        <AttributeRows fund={holding} />
      </div>
    </article>
  );
}

/**
 * Aggregates the per-fund breakdowns into the portfolio snapshot.
 *
 * Contribution, current value and gain are additive across funds. The
 * percentage is recomputed from those sums rather than averaged — averaging
 * percentages across positions of different sizes gives a figure that belongs
 * to no position. Funds with no published unit value are excluded from the
 * valued figures and reported separately, so an unvalued fund never contributes
 * a silent zero.
 */
function aggregate(breakdowns) {
  const valued = breakdowns.filter(Boolean);

  const contribution = valued.reduce((s, b) => s + b.totals.contribution, 0);
  const unitsValue = valued.reduce((s, b) => s + b.totals.unitsValue, 0);
  const gain = valued.reduce((s, b) => s + b.totals.gain, 0);
  const units = valued.reduce((s, b) => s + b.totals.units, 0);

  // Every valued fund is measured to its own price date. With one fund that is
  // simply that fund's date; with several, the earliest is the honest stamp
  // because the aggregate is only as current as its oldest input.
  const asOf = valued
    .map((b) => b.totals.unitValueAsOf)
    .filter(Boolean)
    .sort()[0];

  return {
    contribution,
    unitsValue,
    gain,
    units,
    gainPct: contribution > 0 ? (gain / contribution) * 100 : 0,
    unitValueAsOf: asOf,
    fundCount: valued.length,
  };
}

function InvestmentPage() {
  const { investor } = useOutletContext();
  const [holdings, setHoldings] = useState([]);
  // fundCode -> breakdown, or fundCode -> { unvalued: message }
  const [breakdowns, setBreakdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchHoldings()
      .then(async (list) => {
        if (cancelled) return;
        setHoldings(list);

        // One breakdown per held fund. The snapshot sums them rather than
        // reading a single fund's totals as the portfolio, which is what the
        // previous single-call version did.
        const results = await Promise.all(
          list.map((h) =>
            fetchBreakdown(h.fundCode).then(
              (b) => [h.fundCode, b],
              (err) => {
                // 422 means no published unit value. A real state, not a
                // failure — carry the message through to the UI.
                if (err?.response?.status === 422) {
                  return [
                    h.fundCode,
                    { unvalued: err.response.data?.message || "This fund has no published unit value." },
                  ];
                }
                throw err;
              },
            ),
          ),
        );

        if (!cancelled) setBreakdowns(Object.fromEntries(results));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Could not load your portfolio.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = investor?.name?.trim().split(" ")[0] || "Investor";

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading portfolio…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (holdings.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="font-display text-[40px] leading-[1.02] text-[#111111]">
          Welcome back, {firstName}.
        </h1>
        <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center">
          <p className="text-sm text-[#6b7280]">
            You don&rsquo;t have any holdings yet. Once your investment is
            active, it&rsquo;ll appear here.
          </p>
        </div>
      </div>
    );
  }

  const valuedBreakdowns = holdings.map((h) => {
    const b = breakdowns[h.fundCode];
    return b && !b.unvalued ? b : null;
  });
  const snapshot = aggregate(valuedBreakdowns);
  const multiFund = holdings.length > 1;

  const snapshotMetrics = [
    {
      label: "Amount Invested",
      icon: DollarSign,
      value: formatCurrencyDetailed(snapshot.contribution),
    },
    {
      label: "Current Value",
      icon: PieChart,
      value: formatCurrencyDetailed(snapshot.unitsValue),
      sub: formatDateNumeric(snapshot.unitValueAsOf),
    },
    {
      label: "Total Return",
      icon: BarChart3,
      value: formatSignedCurrency(snapshot.gain),
      color: gainColor(snapshot.gain),
      sub: formatPercent(snapshot.gainPct),
      subColor: gainColor(snapshot.gainPct),
    },
    {
      label: "Units Held",
      icon: Users,
      value: formatUnitsFixed(snapshot.units),
      // Units of different funds are not the same instrument, so a combined
      // count is a holding, never a valuation input. Say which it is.
      sub: multiFund ? `across ${snapshot.fundCount} funds` : undefined,
    },
  ];

  return (
    <div className="space-y-10">
      <h1 className="font-display text-[40px] leading-[1.02] text-[#111111]">
        Welcome back, {firstName}.
      </h1>

      <section>
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Portfolio Snapshot
        </h2>
        <div className="mt-4 rounded-[22px] border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
          <MetricStrip metrics={snapshotMetrics} size="lg" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Your Funds
        </h2>
        <div className="mt-4 space-y-5">
          {holdings.map((h) => {
            const b = breakdowns[h.fundCode];
            return (
              <FundCard
                key={h.fundCode}
                holding={h}
                breakdown={b && !b.unvalued ? b : null}
                unvaluedMessage={b?.unvalued}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default InvestmentPage;
