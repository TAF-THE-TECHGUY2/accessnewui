import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";

import {
  addFundUnitPrice,
  declareFundDistribution,
  declareFundFee,
  deleteFundDistribution,
  deleteFundFee,
  deleteFundUnitPrice,
  fetchAdminFund,
} from "../../services/adminService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount ?? 0);

function Section({ title, children, action }) {
  return (
    <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-soft">
      <div className="flex items-end justify-between gap-3">
        <h3 className="font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AddUnitPriceForm({ fundCode, onAdded }) {
  const [form, setForm] = useState({ price: "", date: "", quarter: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await addFundUnitPrice(fundCode, {
        price: Number(form.price),
        date: form.date,
        quarter: form.quarter || undefined,
      });
      setForm({ price: "", date: "", quarter: "" });
      onAdded();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not add price.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <input
        required
        type="number"
        step="0.0001"
        placeholder="Price (e.g. 114.00)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
      />
      <input
        required
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
      />
      <input
        type="text"
        placeholder="Quarter (auto)"
        value={form.quarter}
        onChange={(e) => setForm({ ...form, quarter: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
      />
      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-[10px] bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "…" : "Add"}
      </button>
      {error ? (
        <p className="sm:col-span-4 rounded-[10px] bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function DeclareDistributionForm({ fundCode, onDeclared }) {
  const [form, setForm] = useState({ amountPerUnit: "", paidAt: "", distributionType: "income" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await declareFundDistribution(fundCode, {
        amountPerUnit: Number(form.amountPerUnit),
        paidAt: form.paidAt,
        distributionType: form.distributionType,
      });
      setMessage(res.message);
      setForm({ amountPerUnit: "", paidAt: "", distributionType: "income" });
      onDeclared();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Could not declare distribution.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <input
        required
        type="number"
        step="0.000001"
        placeholder="$ per unit"
        value={form.amountPerUnit}
        onChange={(e) => setForm({ ...form, amountPerUnit: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      />
      <input
        required
        type="date"
        value={form.paidAt}
        onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      />
      <select
        value={form.distributionType}
        onChange={(e) => setForm({ ...form, distributionType: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      >
        <option value="income">Income</option>
        <option value="return_of_capital">Return of capital</option>
      </select>
      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-[10px] bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "…" : "Declare"}
      </button>
      {message ? (
        <p className="sm:col-span-4 rounded-[10px] bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function DeclareFeeForm({ fundCode, onDeclared }) {
  const [form, setForm] = useState({
    feeType: "aum",
    rate: "0.0150",
    periodStart: "",
    periodEnd: "",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await declareFundFee(fundCode, {
        feeType: form.feeType,
        rate: Number(form.rate),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        description: form.description || undefined,
      });
      setMessage(res.message);
      onDeclared();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Could not declare fee.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
      <select
        value={form.feeType}
        onChange={(e) => setForm({ ...form, feeType: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      >
        <option value="aum">AUM fee</option>
        <option value="performance">Performance fee</option>
      </select>
      <input
        required
        type="number"
        step="0.0001"
        min="0"
        max="1"
        placeholder="Rate (0.015 = 1.5%)"
        value={form.rate}
        onChange={(e) => setForm({ ...form, rate: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      />
      <input
        required
        type="date"
        value={form.periodStart}
        onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      />
      <input
        required
        type="date"
        value={form.periodEnd}
        onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
        className="h-10 rounded-[10px] border border-black/10 px-3 text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-[10px] bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "…" : "Declare"}
      </button>
      {message ? (
        <p className="sm:col-span-5 rounded-[10px] bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function FundDetailPage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = () => fetchAdminFund(code).then(setData);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }
  if (!data) {
    return <p className="text-sm text-red-700">Fund not found.</p>;
  }

  const { fund, aumAtCost, aumAtNav, holdingsCount, unitPrices, recentDistributions, recentFees } = data;

  return (
    <div className="space-y-6">
      <Link to="/admin/funds" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All funds
      </Link>

      <header>
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
          {fund.code} · {fund.fundType}
        </p>
        <h2 className="font-display text-[28px] text-ink">{fund.name}</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[16px] border border-black/5 bg-white p-4 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">AUM at cost</p>
          <p className="font-display mt-1 text-[22px] text-ink">{formatCurrency(aumAtCost)}</p>
        </div>
        <div className="rounded-[16px] border border-black/5 bg-white p-4 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">AUM at NAV</p>
          <p className="font-display mt-1 text-[22px] text-ink">{formatCurrency(aumAtNav)}</p>
        </div>
        <div className="rounded-[16px] border border-black/5 bg-white p-4 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Holders</p>
          <p className="font-display mt-1 text-[22px] text-ink">{holdingsCount}</p>
        </div>
        <div className="rounded-[16px] border border-black/5 bg-white p-4 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Current NAV</p>
          <p className="font-display mt-1 text-[22px] text-ink">
            {fund.currentUnitPrice ? `$${fund.currentUnitPrice.toFixed(4)}` : "—"}
          </p>
          {fund.currentUnitPriceDate ? (
            <p className="mt-1 text-xs text-gray-500">as of {fund.currentUnitPriceDate}</p>
          ) : null}
        </div>
      </div>

      <Section
        title="Unit prices"
        action={<span className="text-xs text-gray-500">{unitPrices.length} entries</span>}
      >
        <AddUnitPriceForm fundCode={code} onAdded={reload} />
        <div className="mt-4 overflow-hidden rounded-[12px] border border-black/5">
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf8] text-[11px] uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Quarter</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {unitPrices.map((p) => (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-2 text-ink">{p.quarter}</td>
                  <td className="px-4 py-2 text-gray-500">{p.date}</td>
                  <td className="px-4 py-2 text-right text-ink">${p.price.toFixed(4)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete ${p.quarter} price?`)) {
                          await deleteFundUnitPrice(p.id);
                          reload();
                        }
                      }}
                      className="text-red-700 hover:text-red-900"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Declare distribution"
        action={<span className="text-xs text-gray-500">auto-allocated across all holdings</span>}
      >
        <DeclareDistributionForm fundCode={code} onDeclared={reload} />
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            Recent distributions ({recentDistributions.length})
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {recentDistributions.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-[10px] bg-[#fafaf8] px-3 py-1.5">
                <span className="text-gray-500">{d.paidAt} · {d.type}</span>
                <span className="flex items-center gap-3">
                  <span>{formatCurrency(d.amount)}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Delete this distribution row?")) {
                        await deleteFundDistribution(d.id);
                        reload();
                      }
                    }}
                    className="text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        title="Declare fee"
        action={<span className="text-xs text-gray-500">auto-allocated across all holdings</span>}
      >
        <DeclareFeeForm fundCode={code} onDeclared={reload} />
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
            Recent fees ({recentFees.length})
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {recentFees.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-[10px] bg-[#fafaf8] px-3 py-1.5">
                <span className="text-gray-500">
                  {f.feeType} · {f.periodStart} → {f.periodEnd}
                </span>
                <span className="flex items-center gap-3">
                  <span>{formatCurrency(f.amount)}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Delete this fee row?")) {
                        await deleteFundFee(f.id);
                        reload();
                      }
                    }}
                    className="text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}

export default FundDetailPage;
