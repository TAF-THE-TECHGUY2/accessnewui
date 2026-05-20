import { useEffect, useState } from "react";
import { Save, Settings, ShieldCheck, BellRing, Server } from "lucide-react";
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

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

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
    const saved = await saveSettings(settings);
    setSettings(saved);
    setSaving(false);
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

        <button type="button" className="admin-button" onClick={handleSave}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save settings"}
        </button>
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
      </section>
    </div>
  );
}

export default SettingsPage;
