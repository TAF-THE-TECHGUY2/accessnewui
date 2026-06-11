import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { createAdminInvestor, fetchAdminFunds } from "../../services/adminService";

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

function CreateInvestorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [funds, setFunds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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
            </div>
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
