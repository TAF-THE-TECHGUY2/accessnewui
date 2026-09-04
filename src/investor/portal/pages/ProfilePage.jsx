import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  Loader2,
  Lock,
  Pencil,
  Shield,
  ShieldCheck,
} from "lucide-react";

import {
  changePortalPassword,
  fetchPortalDocuments,
  fetchPortalProfile,
  updatePortalProfile,
} from "../../../services/investorPortalService";

// Ordered to read across the two columns as pairs: name beside phone, the two
// address lines together, city beside state, postcode beside country.
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
  { key: "accreditationStatus", label: "Accreditation status", format: "status" },
  { key: "residency", label: "Residency" },
  { key: "taxIdLast4", label: "Tax ID (last 4)" },
  { key: "code", label: "Investor reference" },
  { key: "joinedAt", label: "Member since", format: "date" },
];

const titleCase = (v) =>
  v ? String(v).replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

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

/**
 * The three verification states.
 *
 * `confirmed` drives only the icon treatment — a filled dark circle for a
 * settled state, a light ring for anything else. The label underneath is always
 * the real value, so a pending accreditation reads as pending rather than
 * borrowing the confirmed styling.
 */
function StatusCell({ icon: Icon, label, value, confirmed }) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
          confirmed ? "bg-[#0f3d3e] text-white" : "border border-black/10 bg-[#eef5f4] text-[#0f3d3e]"
        }`}
      >
        {confirmed ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-5 w-5" />}
      </span>
      <div>
        <p className="text-[15px] font-medium text-[#111111]">{label}</p>
        <p className="mt-0.5 text-[13px] text-[#6b7280]">{value}</p>
      </div>
    </div>
  );
}

function StatusStrip({ status, documents }) {
  const accreditation = status?.accreditation;
  const kyc = status?.kyc;

  // portal_documents carries no signing state, so completeness cannot be
  // asserted. What is knowable is how many documents the investor has actually
  // been issued, and that is what this reports.
  const documentsValue =
    documents == null
      ? "Loading…"
      : documents === 0
        ? "None yet"
        : `${documents} available`;

  return (
    <section className="grid divide-y divide-black/10 rounded-[22px] border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,61,62,0.06)] sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
      <StatusCell
        icon={ShieldCheck}
        label="Accredited"
        value={titleCase(accreditation) || "Not on file"}
        confirmed={/^(accredited|confirmed|verified|approved)$/i.test(accreditation || "")}
      />
      <StatusCell
        icon={ShieldCheck}
        label="KYC"
        value={titleCase(kyc) || "Not on file"}
        confirmed={/^(verified|approved|passed|clear)$/i.test(kyc || "")}
      />
      <StatusCell
        icon={FileCheck}
        label="Documents"
        value={documentsValue}
        confirmed={false}
      />
    </section>
  );
}

/**
 * Password change.
 *
 * Behind a disclosure rather than always open: it is the least-used control on
 * the page, and eight always-visible fields would compete with the details the
 * investor came here to check.
 */
function SecurityPanel() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setDone(null);
    try {
      const result = await changePortalPassword(form);
      setDone(result?.message || "Password updated.");
      setForm({ currentPassword: "", password: "", passwordConfirmation: "" });
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(
        fieldError || err?.response?.data?.message || "Could not change your password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[22px] border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef5f4] text-[#0f3d3e]">
          <Shield className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="font-display block text-[18px] leading-tight text-[#111111]">
            Security &amp; preferences
          </span>
          <span className="mt-0.5 block text-sm text-[#6b7280]">
            Manage your password and communication preferences.
          </span>
        </span>
        <ChevronRight
          className={`h-5 w-5 shrink-0 text-[#6b7280] transition ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-black/5 px-6 py-6">
          <h3 className="text-[15px] font-medium text-[#111111]">
            Change your password
          </h3>
          <p className="mt-1 text-[13px] text-[#6b7280]">
            Changing it signs out any other device you are logged in on.
          </p>

          {done ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> {done}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-[12px] bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
                Current password
              </span>
              <input
                type="password"
                name="currentPassword"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={change}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-teal-600 md:w-1/2"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
                New password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={change}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
                Confirm new password
              </span>
              <input
                type="password"
                name="passwordConfirmation"
                autoComplete="new-password"
                value={form.passwordConfirmation}
                onChange={change}
                className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-teal-600"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-black px-5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Newsletter opt-in / opt-out.
 *
 * Optimistic: the segmented control moves on click and the request follows,
 * because a preference toggle that waits on a round trip reads as broken. A
 * failure puts it back where it was and says so — silently reverting would
 * leave the investor believing they had opted out.
 */
function NewsletterToggle({ value, onChange }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  const shown = pending ?? value;

  const set = async (next) => {
    if (next === shown) return;
    setPending(next);
    setError(null);
    try {
      await onChange(next);
      setPending(null);
    } catch (err) {
      setPending(null);
      setError(
        err?.response?.data?.message ||
          "Could not save that. Your preference is unchanged.",
      );
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
          Newsletter
        </p>
        <p className="mt-1 text-sm text-[#6b7280]">
          Choose how you&rsquo;d like to receive updates and insights.
        </p>
        {error ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        ) : null}
      </div>

      <div
        role="group"
        aria-label="Newsletter preference"
        className="inline-flex overflow-hidden rounded-[12px] border border-black/10"
      >
        {[
          { on: true, label: "Opted in" },
          { on: false, label: "Opted out" },
        ].map(({ on, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => set(on)}
            aria-pressed={shown === on}
            className={`px-5 py-2.5 text-sm font-medium transition ${
              shown === on
                ? "bg-[#0f3d3e] text-white"
                : "bg-white text-[#4b5563] hover:bg-[#f7f7f7]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [documentCount, setDocumentCount] = useState(null);
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
        setError(err?.response?.data?.message || "Could not load your profile."),
      )
      .finally(() => setLoading(false));

    // The Documents pill counts what the documents endpoint actually returns.
    // A failure here leaves it at null — "Loading…" is wrong but a fabricated
    // zero would be worse, so the count is simply not asserted.
    fetchPortalDocuments()
      .then((grouped) =>
        setDocumentCount(
          Object.values(grouped || {}).reduce(
            (n, list) => n + (list?.length ?? 0),
            0,
          ),
        ),
      )
      .catch(() => setDocumentCount(null));
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
        fieldError || err?.response?.data?.message || "Could not save changes.",
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
    <div className="space-y-5">
      <StatusStrip status={profile.status} documents={documentCount} />

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
              className="inline-flex items-center gap-2 rounded-[12px] border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-black/30"
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
                  {field.label}{" "}
                  {field.optional ? (
                    <span className="text-[#9ca3af]">(optional)</span>
                  ) : null}
                </span>
                <input
                  type={field.type}
                  name={field.key}
                  autoComplete={field.autoComplete}
                  value={form[field.key] || ""}
                  onChange={handleChange}
                  className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-teal-600"
                />
              </label>
            ))}
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-black px-5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-[12px] border border-black/10 bg-white px-5 text-sm font-medium text-ink transition hover:border-black/30"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {EDITABLE_FIELDS.map((field) => (
              <Field key={field.key} label={field.label}>
                {profile.editable[field.key] || (
                  <span className="text-[#9ca3af]">—</span>
                )}
              </Field>
            ))}
          </div>
        )}

        <NewsletterToggle
          value={profile.editable.newsletterOptedIn !== false}
          onChange={async (next) => {
            const updated = await updatePortalProfile({ newsletterOptedIn: next });
            setProfile(updated);
            // Merge the one key rather than replacing the form from the
            // response: the toggle sits below the edit form, and replacing
            // would discard an address the investor was midway through typing.
            setForm((current) => ({
              ...current,
              newsletterOptedIn: updated.editable.newsletterOptedIn,
            }));
          }}
        />
      </section>

      <section className="rounded-[22px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <h2 className="font-display flex items-center gap-2 text-[24px] leading-tight text-[#111111]">
          Verified details
          <Lock className="h-4 w-4 text-[#6b7280]" />
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
                : field.format === "status"
                  ? titleCase(raw)
                  : raw;
            return (
              <Field key={field.key} label={field.label} locked>
                {value ? String(value) : <span className="text-[#9ca3af]">—</span>}
              </Field>
            );
          })}
        </div>
      </section>

      <SecurityPanel />
    </div>
  );
}

export default ProfilePage;
