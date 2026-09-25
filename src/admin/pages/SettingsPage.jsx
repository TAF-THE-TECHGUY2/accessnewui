import { useEffect, useState } from "react";
import {
  Save,
  Settings,
  ShieldCheck,
  BellRing,
  Server,
  Scale,
  Mail,
  LogIn,
} from "lucide-react";
import LoadingState from "../components/LoadingState";
import { getSettings, saveSettings } from "../../services/adminService";

function SettingCard({ icon: Icon, title, description, children }) {
  return (
    <section className="admin-card p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TextField({ label, description, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">{label}</label>
      <input
        className="admin-input"
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="mt-1.5 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSettings();
      setSettings(data);
    };

    loadSettings();
  }, []);

  if (!settings) {
    return <LoadingState label="Loading settings..." />;
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveState(null);
    try {
      const saved = await saveSettings(settings);
      setSettings(saved);
      setSaveState({ ok: true, message: "Settings saved." });
    } catch (error) {
      // Without this the button sat on "Saving..." forever and the rejected
      // value stayed on screen, so a mistyped URL looked like it had saved.
      const errors = error?.response?.data?.errors;
      setSaveState({
        ok: false,
        message:
          (errors ? Object.values(errors).flat()[0] : null) ||
          error?.response?.data?.message ||
          "Could not save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-card flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="metric-kicker">Settings</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">
            Platform configuration
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Mock settings are persisted locally through the admin service layer.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <button
            type="button"
            className="admin-button"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save settings"}
          </button>
          {saveState ? (
            <p
              className={`text-sm ${
                saveState.ok ? "text-teal-700" : "text-red-600"
              }`}
            >
              {saveState.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SettingCard
          icon={Settings}
          title="Organization"
          description="Basic organization profile and investor defaults."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Organization name
              </label>
              <input
                className="admin-input"
                value={settings.organizationName}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organizationName: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Default country
              </label>
              <input
                className="admin-input"
                value={settings.defaultCountry}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    defaultCountry: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={Server}
          title="Laravel API"
          description="Placeholder environment controls for the future backend connection."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                API environment
              </label>
              <select
                className="admin-select"
                value={settings.apiEnvironment}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    apiEnvironment: event.target.value,
                  }))
                }
              >
                <option>Sandbox</option>
                <option>Staging</option>
                <option>Production</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Review SLA hours
              </label>
              <input
                type="number"
                className="admin-input"
                value={settings.reviewSlaHours}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    reviewSlaHours: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={BellRing}
          title="Notifications"
          description="Control internal alerts for investor operations."
        >
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-sand-200 p-4 text-sm">
              <span className="font-medium text-ink">Notify on new KYC submissions</span>
              <input
                type="checkbox"
                checked={settings.notifyOnSubmission}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    notifyOnSubmission: event.target.checked,
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-sand-200 p-4 text-sm">
              <span className="font-medium text-ink">Notify on funding received</span>
              <input
                type="checkbox"
                checked={settings.notifyOnFunding}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    notifyOnFunding: event.target.checked,
                  }))
                }
              />
            </label>
          </div>
        </SettingCard>

        <SettingCard
          icon={ShieldCheck}
          title="Access Controls"
          description="Behavior for dashboard activation after compliance review."
        >
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-sand-200 p-4 text-sm">
              <span className="font-medium text-ink">
                Auto-activate investor dashboard after approval
              </span>
              <input
                type="checkbox"
                checked={settings.autoActivateDashboard}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    autoActivateDashboard: event.target.checked,
                  }))
                }
              />
            </label>
            <label className="flex items-start justify-between gap-4 rounded-2xl border border-sand-200 p-4 text-sm">
              <span>
                <span className="font-medium text-ink">
                  Allow parallel onboarding steps
                </span>
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  When off, investors complete steps one at a time in order. When on,
                  all steps are unlocked simultaneously — they can do Persona,
                  InvestReady, and DocuSign in parallel.
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.allowParallelOnboarding || false}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    allowParallelOnboarding: event.target.checked,
                  }))
                }
              />
            </label>
            <label
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 text-sm ${
                settings.demoPaymentsEnabled
                  ? "border-red-300 bg-red-50/60"
                  : "border-sand-200"
              }`}
            >
              <span>
                <span className="font-medium text-ink">Demo payment mode</span>
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  Lets investors complete the funding step without Stripe, for
                  demos on environments with no payment credentials. Units are
                  issued for real at the fund&rsquo;s current book value.
                </span>
                {settings.demoPaymentsEnabled ? (
                  <span className="mt-2 block text-xs font-medium text-red-700">
                    On — the platform will record capital that was never
                    received. Never leave this enabled in production.
                  </span>
                ) : null}
              </span>
              <input
                type="checkbox"
                checked={settings.demoPaymentsEnabled || false}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    demoPaymentsEnabled: event.target.checked,
                  }))
                }
              />
            </label>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Support email
              </label>
              <input
                className="admin-input"
                value={settings.supportEmail}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    supportEmail: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard
          icon={Scale}
          title="Legal links"
          description="Where the consent checkboxes on the create-account page point. Both open in a new tab so an applicant keeps their place."
        >
          <div className="space-y-4">
            <TextField
              label="Terms of Use"
              type="url"
              placeholder="https://www.ap.boston/..."
              description="Linked from “I agree to the Terms of Use”."
              value={settings.termsOfUseUrl}
              onChange={(value) =>
                setSettings((current) => ({ ...current, termsOfUseUrl: value }))
              }
            />
            <TextField
              label="Privacy Policy"
              type="url"
              placeholder="https://www.ap.boston/..."
              description="Linked from “I acknowledge the Privacy Policy”."
              value={settings.privacyPolicyUrl}
              onChange={(value) =>
                setSettings((current) => ({
                  ...current,
                  privacyPolicyUrl: value,
                }))
              }
            />
            <p className="rounded-2xl border border-sand-200 p-4 text-xs text-slate-500">
              These pages live on the marketing site. Use the{" "}
              <span className="font-medium text-ink">www</span> host — the bare
              domain only redirects its home page, so an address like
              ap.boston/terms-of-use returns a 404.
            </p>
          </div>
        </SettingCard>

        <SettingCard
          icon={LogIn}
          title="Sign-in page"
          description="The investor portal sits on its own subdomain, so the sign-in page needs a way back to wherever visitors came from."
        >
          <TextField
            label="Back link"
            type="url"
            placeholder="https://www.ap.boston"
            description="Shown as a Back button under Sign in. Leave empty to hide the button entirely."
            value={settings.loginBackUrl}
            onChange={(value) =>
              setSettings((current) => ({ ...current, loginBackUrl: value }))
            }
          />
        </SettingCard>

        <SettingCard
          icon={Mail}
          title="Email sender"
          description="How outgoing email identifies itself. Applies to every template unless a template overrides it."
        >
          <div className="space-y-4">
            <TextField
              label="From name"
              placeholder="Access Properties"
              description="The name investors see in their inbox."
              value={settings.mailFromName}
              onChange={(value) =>
                setSettings((current) => ({ ...current, mailFromName: value }))
              }
            />
            <TextField
              label="From address"
              type="email"
              placeholder={
                settings.mailSendingDomain
                  ? `hello@${settings.mailSendingDomain}`
                  : "hello@example.com"
              }
              description={
                settings.mailSendingDomain
                  ? `Must be on ${settings.mailSendingDomain} — the only domain verified to send. Another domain would be refused or land in spam.`
                  : "The address outgoing mail is sent from."
              }
              value={settings.mailFromAddress}
              onChange={(value) =>
                setSettings((current) => ({ ...current, mailFromAddress: value }))
              }
            />
            <TextField
              label="Reply-to address"
              type="email"
              placeholder="hello@ap.boston"
              description="Where replies land. Any domain — this one isn’t signed, so it can be a real staffed mailbox."
              value={settings.mailReplyToAddress}
              onChange={(value) =>
                setSettings((current) => ({
                  ...current,
                  mailReplyToAddress: value,
                }))
              }
            />
          </div>
        </SettingCard>
      </section>
    </div>
  );
}

export default SettingsPage;
