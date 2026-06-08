import { useEffect, useState } from "react";
import { Megaphone, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";

import {
  createAdminCommunication,
  deleteAdminCommunication,
  fetchAdminCommunications,
  updateAdminCommunication,
} from "../../services/adminService";

const EMPTY = {
  type: "update",
  title: "",
  summary: "",
  bodyHtml: "",
  audience: "all",
  isPublished: false,
};

function ComposerModal({ open, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(initial || EMPTY);
    setError(null);
  }, [initial, open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const saved = initial?.id
        ? await updateAdminCommunication(initial.id, form)
        : await createAdminCommunication(form);
      onSaved(saved);
      onClose();
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(fieldError || err?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
      <div className="mt-12 w-full max-w-2xl rounded-[22px] bg-white p-6 shadow-[0_30px_80px_rgba(17,24,39,0.2)]">
        <h3 className="font-display text-[22px] text-ink">
          {initial?.id ? "Edit communication" : "New communication"}
        </h3>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
              >
                <option value="update">Update</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Title</span>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Summary (optional)</span>
            <input
              type="text"
              maxLength={500}
              value={form.summary || ""}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Body (HTML supported)
            </span>
            <textarea
              required
              rows={10}
              value={form.bodyHtml}
              onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
              className="mt-1.5 w-full rounded-[10px] border border-black/10 p-3 text-sm font-mono"
              placeholder="<p>Body content here…</p>"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                Audience
              </span>
              <select
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm"
              >
                <option value="all">Everyone</option>
                <option value="accredited">Accredited investors</option>
                <option value="non_accredited">Non-accredited investors</option>
                <option value="fund:apdif-1">APDIF-I holders only</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={!!form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-ink">Published (visible to investors)</span>
            </label>
          </div>
          {error ? (
            <p className="rounded-[10px] bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
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
              disabled={busy}
              className="h-10 rounded-[10px] bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommunicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const reload = () => fetchAdminCommunications().then(setItems);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="metric-kicker">Investor communications</p>
          <h2 className="mt-1.5 text-xl font-semibold text-ink md:text-2xl">Communications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Compose updates and newsletters. Published posts appear in investor portals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setComposerOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-[14px] bg-black px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-[#1f2937]"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </header>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center text-sm text-gray-500">
            No posts yet.
          </div>
        ) : (
          items.map((c) => {
            const Icon = c.type === "newsletter" ? Newspaper : Megaphone;
            return (
              <article
                key={c.id}
                className="flex items-start justify-between gap-4 rounded-[18px] border border-black/5 bg-white p-5 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-[10px] bg-[#eef5f4] p-2 text-[#0f3d3e]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                      {c.type} ·{" "}
                      {c.isPublished ? (
                        <span className="text-emerald-700">Published</span>
                      ) : (
                        <span className="text-amber-700">Draft</span>
                      )}{" "}
                      · audience: {c.audience}
                    </p>
                    <h3 className="mt-1 font-semibold text-ink">{c.title}</h3>
                    {c.summary ? (
                      <p className="mt-1 text-sm text-gray-500">{c.summary}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c);
                      setComposerOpen(true);
                    }}
                    className="rounded-[8px] p-2 text-gray-500 hover:bg-gray-100 hover:text-ink"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Delete "${c.title}"?`)) {
                        await deleteAdminCommunication(c.id);
                        reload();
                      }
                    }}
                    className="rounded-[8px] p-2 text-red-700 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ComposerModal
        open={composerOpen}
        initial={editing}
        onClose={() => setComposerOpen(false)}
        onSaved={() => reload()}
      />
    </div>
  );
}

export default CommunicationsPage;
