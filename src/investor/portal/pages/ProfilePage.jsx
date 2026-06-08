import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Lock, Pencil } from "lucide-react";

import {
  fetchPortalProfile,
  updatePortalProfile,
} from "../../../services/investorPortalService";

const EDITABLE_FIELDS = [
  { key: "name", label: "Full name", type: "text", autoComplete: "name" },
  { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { key: "addressLine1", label: "Address line 1", type: "text", autoComplete: "address-line1" },
  { key: "addressLine2", label: "Address line 2", type: "text", autoComplete: "address-line2", optional: true },
  { key: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { key: "stateProvince", label: "State / Province", type: "text", autoComplete: "address-level1" },
  { key: "zipPostalCode", label: "ZIP / Postal", type: "text", autoComplete: "postal-code" },
  { key: "country", label: "Country", type: "text", autoComplete: "country-name" },
];

const READONLY_FIELDS = [
  { key: "email", label: "Login email" },
  { key: "investorType", label: "Investor type" },
  { key: "entityName", label: "Entity name" },
  { key: "accreditationStatus", label: "Accreditation status" },
  { key: "residency", label: "Residency" },
  { key: "taxIdLast4", label: "Tax ID (last 4)" },
  { key: "code", label: "Investor reference" },
  { key: "joinedAt", label: "Member since", format: "date" },
];

function Field({ label, children, locked = false }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
        {label}
        {locked ? <Lock className="h-3 w-3" /> : null}
      </p>
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </div>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    fetchPortalProfile()
      .then((data) => {
        setProfile(data);
        setForm(data.editable || {});
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load your profile.")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCancel = () => {
    setForm(profile.editable);
    setEditing(false);
    setError(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePortalProfile(form);
      setProfile(updated);
      setForm(updated.editable);
      setEditing(false);
      setSavedAt(new Date().toISOString());
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(
        fieldError || err?.response?.data?.message || "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading profile…</p>;
  }

  if (!profile) {
    return <p className="text-sm text-red-700">{error || "Profile unavailable."}</p>;
  }

  const readonly = profile.readonly || {};

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[24px] leading-tight text-[#111111]">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Keep your contact and mailing details current.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:border-black/30"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          ) : null}
        </div>

        {savedAt && !editing ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> Profile saved.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        ) : null}

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 grid gap-5 md:grid-cols-2">
            {EDITABLE_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
                  {field.label} {field.optional ? <span className="text-[#9ca3af]">(optional)</span> : null}
                </span>
                <input
                  type={field.type}
                  name={field.key}
                  autoComplete={field.autoComplete}
                  value={form[field.key] || ""}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-ink shadow-soft outline-none focus:border-teal-600"
                />
              </label>
            ))}
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-black px-5 text-sm font-medium text-white shadow-[0_14px_24px_rgba(17,24,39,0.24)] transition hover:bg-[#1f2937] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-black/10 bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:border-black/30"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {EDITABLE_FIELDS.map((field) => (
              <Field key={field.key} label={field.label}>
                {profile.editable[field.key] || <span className="text-[#9ca3af]">—</span>}
              </Field>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[22px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Verified details
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Locked fields require an admin to update — most affect your
          accreditation or login.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {READONLY_FIELDS.map((field) => {
            const raw = readonly[field.key];
            const value =
              field.format === "date" && raw
                ? new Date(raw).toLocaleDateString()
                : raw;
            return (
              <Field key={field.key} label={field.label} locked>
                {value ? (
                  String(value)
                ) : (
                  <span className="text-[#9ca3af]">—</span>
                )}
              </Field>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
