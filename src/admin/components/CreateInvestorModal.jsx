import { useEffect, useState } from "react";
import { AlertCircle, Info, Loader2, UserPlus } from "lucide-react";

import {
  createAdminInvestor,
  fetchAdminFunds,
  fetchFundPricePreview,
} from "../../services/adminService";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  zipPostalCode: "",
  country: "United States",
  investorType: "Individual",
  entityName: "",
  accreditationStatus: "accredited",
  commitment: 10000,
  fundCode: "",
  // Blank means "create the profile only". Supplying a date records the
  // investment immediately, priced at the book value published on that date.
  investmentDate: "",
  unitPriceOverride: "",
};

function Field({ label, name, value, onChange, type = "text", required = false, autoComplete }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
      />
    </label>
  );
}

/**
 * Shows what a dated investment will actually record before it is committed.
 *
 * A wrong date produces a wrong unit price, which produces a wrong unit count,
 * which is invisible until someone reconciles the position months later. This
 * puts the arithmetic on screen so it can be checked against the fund's records.
 */
function PricePreview({ preview, loading, error }) {
  if (loading) {
    return (
      <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Looking up the unit price for that date…
      </p>
    );
  }

  if (error) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs text-red-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="mt-3 rounded-[12px] border border-black/10 bg-[#f8faf9] p-4">
      <div className="flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-gray-500" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          This will record
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
            Unit price
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">
            ${preview.pricePerUnit.toFixed(4)}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {preview.priceOverridden
              ? "manual override"
              : `${preview.quarterLabel} book value`}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
            Units
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">
            {preview.units != null
              ? preview.units.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })
              : "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            amount ÷ unit price
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
            Priced from
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-ink">
            {preview.bookValueAsOf}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            ${preview.bookValue.toFixed(4)} book
            {preview.premiumPct ? ` + ${preview.premiumPct}% premium` : ""}
          </p>
        </div>
      </div>

      {preview.priceOverridden ? (
        <p className="mt-3 text-[11px] leading-4 text-amber-700">
          Overriding the published price. The premium recorded on the
          transaction will be derived from this value, not the fund setting.
        </p>
      ) : null}
    </div>
  );
}

function CreateInvestorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [funds, setFunds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError(null);
      fetchAdminFunds()
        .then((list) => {
          setFunds(list);
          if (list[0]) {
            setForm((f) => ({ ...f, fundCode: list[0].code }));
          }
        })
        .catch(() => setFunds([]));
    }
  }, [open]);

  // Preview refreshes whenever the date, amount, fund or override changes.
  // Debounced because commitment is a text input and would otherwise fire a
  // request per keystroke.
  useEffect(() => {
    if (!open || !form.investmentDate || !form.fundCode) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    const timer = setTimeout(() => {
      fetchFundPricePreview(form.fundCode, {
        date: form.investmentDate,
        amount: Number(form.commitment) || undefined,
        unitPriceOverride: form.unitPriceOverride
          ? Number(form.unitPriceOverride)
          : undefined,
      })
        .then((data) => {
          if (!cancelled) setPreview(data);
        })
        .catch((err) => {
          if (cancelled) return;
          setPreview(null);
          setPreviewError(
            err?.response?.data?.message ||
              "Could not resolve a unit price for that date.",
          );
        })
        .finally(() => {
          if (!cancelled) setPreviewLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    open,
    form.investmentDate,
    form.fundCode,
    form.commitment,
    form.unitPriceOverride,
  ]);

  if (!open) return null;

  const handleChange = (event) => {
    setForm((curr) => ({ ...curr, [event.target.name]: event.target.value }));
  };

  const isEntity = form.investorType !== "Individual";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        commitment: Number(form.commitment),
        entityName: isEntity ? form.entityName : null,
        // Omit rather than send empty strings — the backend treats a missing
        // date as "profile only, no position recorded".
        investmentDate: form.investmentDate || null,
        unitPriceOverride: form.unitPriceOverride
          ? Number(form.unitPriceOverride)
          : null,
      };
      const created = await createAdminInvestor(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(
        fieldError || err?.response?.data?.message || "Could not create investor."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 overflow-y-auto">
      <div className="my-12 w-full max-w-2xl rounded-[22px] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.2)]">
        <div className="flex items-start gap-3">
          <div className="rounded-[12px] bg-[#eef5f4] p-2.5 text-[#0f4f4f]">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-[22px] text-ink">Add investor</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new investor profile. They'll start at the KYC step and
              go through normal onboarding when they log in. Use the override
              panel later if you need to skip steps.
            </p>
          </div>
        </div>

        {funds.length === 0 ? (
          <div className="mt-5 rounded-[12px] bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No active funds exist. Create a fund at <code>/admin/funds</code>{" "}
            before adding investors.
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-5 space-y-5">
          {/* Identity */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Identity
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="First name" name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="given-name" />
              <Field label="Last name" name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="family-name" />
              <Field label="Email (login)" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
              <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" />
              <Field label="Temporary password (8+ chars)" name="password" type="text" value={form.password} onChange={handleChange} required />
            </div>
          </fieldset>

          {/* Address */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Mailing address
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Address line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} required autoComplete="address-line1" />
              <Field label="Address line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} autoComplete="address-line2" />
              <Field label="City" name="city" value={form.city} onChange={handleChange} required autoComplete="address-level2" />
              <Field label="State / Province" name="stateProvince" value={form.stateProvince} onChange={handleChange} required autoComplete="address-level1" />
              <Field label="ZIP / Postal" name="zipPostalCode" value={form.zipPostalCode} onChange={handleChange} required autoComplete="postal-code" />
              <Field label="Country" name="country" value={form.country} onChange={handleChange} required autoComplete="country-name" />
            </div>
          </fieldset>

          {/* Investor type + accreditation */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Investor profile
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                  Investor type <span className="text-red-600">*</span>
                </span>
                <select
                  name="investorType"
                  value={form.investorType}
                  onChange={handleChange}
                  className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
                >
                  <option>Individual</option>
                  <option>LLC</option>
                  <option>Trust</option>
                  <option>Corporation</option>
                </select>
              </label>
              {isEntity ? (
                <Field label="Entity name" name="entityName" value={form.entityName} onChange={handleChange} required />
              ) : <div />}
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                  Accreditation status <span className="text-red-600">*</span>
                </span>
                <select
                  name="accreditationStatus"
                  value={form.accreditationStatus}
                  onChange={handleChange}
                  className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
                >
                  <option value="accredited">Accredited</option>
                  <option value="non_accredited">Non-accredited</option>
                </select>
              </label>
            </div>
          </fieldset>

          {/* Investment */}
          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Investment
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                  Fund <span className="text-red-600">*</span>
                </span>
                <select
                  name="fundCode"
                  value={form.fundCode}
                  onChange={handleChange}
                  required
                  disabled={funds.length === 0}
                  className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm disabled:bg-gray-50"
                >
                  {funds.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Commitment ($, min $10k)"
                name="commitment"
                type="number"
                value={form.commitment}
                onChange={handleChange}
                required
              />
              <Field
                label="Investment date (optional)"
                name="investmentDate"
                type="date"
                value={form.investmentDate}
                onChange={handleChange}
              />
              <Field
                label="Unit price override (optional)"
                name="unitPriceOverride"
                type="number"
                value={form.unitPriceOverride}
                onChange={handleChange}
              />
            </div>

            <p className="mt-2 text-[11px] leading-4 text-gray-500">
              Leave the date blank to create the profile without a position —
              funding then happens through the normal flow. Supplying a date
              records the investment immediately, priced at the book value
              published on that date rather than today's.
            </p>

            <PricePreview
              preview={preview}
              loading={previewLoading}
              error={previewError}
            />
          </fieldset>

          {error ? (
            <div className="rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-10 rounded-[10px] border border-black/10 px-4 text-sm font-medium text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || funds.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#0f4f4f] px-4 text-sm font-medium text-white shadow-soft transition hover:bg-[#0b3f3f] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {busy ? "Creating…" : "Create investor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInvestorModal;
