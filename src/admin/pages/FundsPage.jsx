import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";

import { createAdminFund, fetchAdminFunds } from "../../services/adminService";

const formatCurrency = (amount) =>
  amount == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount);

function CreateFundModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    fundType: "Diversified Income",
    targetYield: "8.0% target",
    inceptionDate: "",
    minimumInvestment: 10000,
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fund = await createAdminFund({
        ...form,
        minimumInvestment: Number(form.minimumInvestment) || null,
      });
      onCreated(fund);
      onClose();
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(fieldError || err?.response?.data?.message || "Could not create fund.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.2)]">
        <h3 className="font-display text-[22px] text-ink">Create fund</h3>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {["code", "name", "fundType", "targetYield"].map((key) => (
            <label key={key} className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                {key}
              </span>
              <input
                type="text"
                required={["code", "name"].includes(key)}
                value={form[key] || ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              inception date
            </span>
            <input
              type="date"
              value={form.inceptionDate}
              onChange={(e) => setForm({ ...form, inceptionDate: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              minimum investment ($)
            </span>
            <input
              type="number"
              min="0"
              value={form.minimumInvestment}
              onChange={(e) => setForm({ ...form, minimumInvestment: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
            />
          </label>
          {error ? (
            <p className="rounded-[12px] bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-[12px] border border-black/10 px-4 text-sm font-medium text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-[12px] bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FundsPage() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const reload = () => fetchAdminFunds().then(setFunds);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="metric-kicker">Fund administration</p>
          <h2 className="mt-1.5 text-xl font-semibold text-ink md:text-2xl">Funds</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage fund definitions, unit prices, distributions, and fees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-[14px] bg-black px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" /> New fund
        </button>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : funds.length === 0 ? (
          <div className="col-span-full rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center text-sm text-gray-500">
            No funds yet. Click "New fund" to create one.
          </div>
        ) : (
          funds.map((f) => (
            <Link
              key={f.code}
              to={`/admin/funds/${f.code}`}
              className="rounded-[18px] border border-black/5 bg-white p-5 shadow-soft transition hover:border-black/15"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-[10px] bg-[#eef5f4] p-2 text-[#0f3d3e]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{f.name}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
                    {f.code} · {f.fundType}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    Status
                  </dt>
                  <dd className="mt-0.5 text-ink">{f.status}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    Holders
                  </dt>
                  <dd className="mt-0.5 text-ink">{f.holdingsCount}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    Current NAV
                  </dt>
                  <dd className="mt-0.5 text-ink">
                    {f.currentUnitPrice ? `$${f.currentUnitPrice.toFixed(4)}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    Minimum
                  </dt>
                  <dd className="mt-0.5 text-ink">{formatCurrency(f.minimumInvestment)}</dd>
                </div>
              </dl>
            </Link>
          ))
        )}
      </div>

      <CreateFundModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(fund) => setFunds((curr) => [...curr, fund])}
      />
    </div>
  );
}

export default FundsPage;
