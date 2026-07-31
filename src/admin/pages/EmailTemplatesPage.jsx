import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Code2,
  Eye,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";

import LoadingState from "../components/LoadingState";
import {
  getEmailTemplate,
  getEmailTemplates,
  previewEmailTemplate,
  resetEmailTemplate,
  sendEmailTemplateTest,
  updateEmailTemplate,
} from "../../services/adminService";
import { formatDateTime } from "../../utils/formatters";

const TABS = [
  { id: "html", label: "HTML body" },
  { id: "text", label: "Plain text" },
];

function Banner({ tone, children }) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${tones[tone]}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [form, setForm] = useState({ subject: "", bodyHtml: "", bodyText: "" });
  const [tab, setTab] = useState("html");

  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEmailTemplates();
        setTemplates(data);
        setActiveKey((curr) => curr || data[0]?.key || null);
      } catch {
        setError("Could not load email templates.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeKey) return;
    let cancelled = false;

    const load = async () => {
      setLoadingDetail(true);
      setError("");
      setNotice("");
      setPreview(null);
      try {
        const data = await getEmailTemplate(activeKey);
        if (cancelled) return;
        setDetail(data);
        setForm({
          subject: data.subject || "",
          bodyHtml: data.bodyHtml || "",
          bodyText: data.bodyText || "",
        });
      } catch {
        if (!cancelled) setError("Could not load that template.");
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeKey]);

  const dirty = useMemo(() => {
    if (!detail) return false;
    return (
      form.subject !== (detail.subject || "") ||
      form.bodyHtml !== (detail.bodyHtml || "") ||
      form.bodyText !== (detail.bodyText || "")
    );
  }, [detail, form]);

  const readApiError = (err, fallback) => {
    const res = err?.response?.data;
    const firstFieldError = Object.values(res?.errors || {})?.[0]?.[0];
    return firstFieldError || res?.message || fallback;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateEmailTemplate(activeKey, {
        subject: form.subject,
        bodyHtml: form.bodyHtml,
        bodyText: form.bodyText || null,
      });
      setDetail(updated);
      setTemplates((curr) =>
        curr.map((t) =>
          t.key === updated.key
            ? { ...t, subject: updated.subject, updatedAt: updated.updatedAt }
            : t,
        ),
      );
      setNotice("Template saved. New emails will use it immediately.");
    } catch (err) {
      setError(readApiError(err, "Could not save the template."));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = useCallback(async () => {
    setPreviewing(true);
    setError("");
    try {
      const result = await previewEmailTemplate(activeKey, {
        subject: form.subject,
        bodyHtml: form.bodyHtml,
        bodyText: form.bodyText || null,
      });
      setPreview(result);
    } catch (err) {
      setError(readApiError(err, "Could not render the preview."));
    } finally {
      setPreviewing(false);
    }
  }, [activeKey, form]);

  const handleTest = async () => {
    setSendingTest(true);
    setError("");
    setNotice("");
    try {
      const result = await sendEmailTemplateTest(activeKey, testEmail);
      setNotice(result.message);
    } catch (err) {
      setError(readApiError(err, "Could not send the test email."));
    } finally {
      setSendingTest(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Restore this template to the version shipped with the app? Your edits will be replaced.",
      )
    ) {
      return;
    }
    setResetting(true);
    setError("");
    setNotice("");
    try {
      const restored = await resetEmailTemplate(activeKey);
      setDetail(restored);
      setForm({
        subject: restored.subject || "",
        bodyHtml: restored.bodyHtml || "",
        bodyText: restored.bodyText || "",
      });
      setPreview(null);
      setNotice("Template restored to the bundled default.");
    } catch (err) {
      setError(readApiError(err, "Could not restore the template."));
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <LoadingState label="Loading email templates..." />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Email templates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit the transactional emails the platform sends automatically. Changes
          take effect on the next email sent.
        </p>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Template list */}
        <aside className="space-y-2">
          {templates.map((t) => {
            const selected = t.key === activeKey;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveKey(t.key)}
                className={`w-full rounded-xl border p-3.5 text-left transition ${
                  selected
                    ? "border-slate-900 bg-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail
                    className={`h-4 w-4 ${selected ? "text-slate-900" : "text-slate-400"}`}
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                  {t.description}
                </p>
                {t.updatedAt ? (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Updated {formatDateTime(t.updatedAt)}
                  </p>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Editor */}
        <section className="min-w-0">
          {loadingDetail || !detail ? (
            <LoadingState label="Loading template..." />
          ) : (
            <div className="space-y-4">
              {/* Available variables */}
              {detail.variables?.length ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Available variables
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.variables.map((v) => (
                      <span
                        key={v.name}
                        title={v.description}
                        className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700"
                      >
                        {`{{ $${v.name} }}`}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs text-slate-500">
                    Hover a variable to see what it contains. PHP and Blade
                    include/extends directives are not allowed.
                  </p>
                </div>
              ) : null}

              {/* Subject */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label
                  htmlFor="tpl-subject"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  Subject line
                </label>
                <input
                  id="tpl-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              {/* Body editor */}
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-1 border-b border-slate-200 px-3 pt-3">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`rounded-t-lg px-3.5 py-2 text-sm font-medium transition ${
                        tab === t.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  {tab === "html" ? (
                    <textarea
                      value={form.bodyHtml}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bodyHtml: e.target.value }))
                      }
                      spellCheck={false}
                      rows={22}
                      className="w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:border-slate-900"
                    />
                  ) : (
                    <>
                      <textarea
                        value={form.bodyText}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, bodyText: e.target.value }))
                        }
                        spellCheck={false}
                        rows={22}
                        className="w-full resize-y rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 text-slate-800 outline-none focus:border-slate-900"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Sent alongside the HTML version. Some clients show this
                        instead, and a missing text part hurts deliverability.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {dirty ? "Save changes" : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewing}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition hover:border-slate-400 disabled:opacity-50"
                >
                  {previewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Preview
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                >
                  {resetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Restore default
                </button>
              </div>

              {/* Test send */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Send a test
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={sendingTest || !testEmail}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sendingTest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send test
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Sends the <strong>saved</strong> template with sample data. Save
                  your edits first if you want to test them.
                </p>
                {dirty ? (
                  <div className="mt-2.5">
                    <Banner tone="warning">
                      You have unsaved changes — the test will use the last saved
                      version.
                    </Banner>
                  </div>
                ) : null}
              </div>

              {/* Preview output */}
              {preview ? (
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Preview
                    </p>
                    <p className="mt-1.5 text-sm text-slate-900">
                      <span className="text-slate-500">Subject: </span>
                      {preview.subject}
                    </p>
                  </div>

                  {preview.missingVariables?.length ? (
                    <div className="px-4 pt-3">
                      <Banner tone="warning">
                        These variables are referenced but not supplied and will
                        render empty:{" "}
                        <span className="font-mono">
                          {preview.missingVariables.join(", ")}
                        </span>
                      </Banner>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 pt-3 text-sm text-emerald-700">
                      <Check className="h-4 w-4" />
                      All referenced variables resolve.
                    </div>
                  )}

                  <div className="p-4">
                    <iframe
                      title="Email preview"
                      srcDoc={preview.html}
                      sandbox=""
                      className="h-[560px] w-full rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default EmailTemplatesPage;
