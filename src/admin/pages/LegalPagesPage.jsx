import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import { fetchLegalPages, updateLegalPage } from "../../services/adminService";

/**
 * Editing the Terms of Use and Privacy Policy.
 *
 * Saving and publishing are separate: legal wording gets drafted over several
 * sittings, and what an investor agrees to should not change halfway through a
 * rewrite. A page that is saved but not published keeps its external link live.
 */
function PageEditor({ page, onSaved }) {
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.bodyHtml || "");
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const dirty = title !== page.title || body !== (page.bodyHtml || "");

  const send = async (kind, payload) => {
    setBusy(kind);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateLegalPage(page.slug, payload);
      onSaved(updated);
      setMessage(
        kind === "publish"
          ? "Published. Investors now see this page instead of the external link."
          : kind === "unpublish"
            ? "Unpublished. The link falls back to the external URL."
            : "Saved as a draft. Investors still see the external link.",
      );
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(fieldError || err?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{page.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {page.live ? (
              <>
                Live at{" "}
                <a
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#0f3d3e] underline underline-offset-4"
                >
                  {page.path} <ExternalLink className="h-3 w-3" />
                </a>
              </>
            ) : (
              "Not published — the onboarding checkbox still uses the external URL from Settings."
            )}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ${
            page.live ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {page.live ? "Published" : "Draft"}
        </span>
      </div>

      <label className="mt-5 block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
          Title
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 h-10 w-full rounded-[10px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
          Content
        </span>
        <span className="mt-1 block text-xs text-gray-500">
          HTML. Headings, paragraphs, lists and links. Scripts and event
          handlers are stripped when you save.
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          spellCheck
          className="mt-2 w-full rounded-[10px] border border-black/10 px-3 py-2 font-mono text-[13px] leading-6 outline-none focus:border-teal-600"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy != null || !dirty}
          onClick={() => send("save", { title, bodyHtml: body })}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-5 text-sm font-medium text-ink transition hover:border-black/30 disabled:opacity-50"
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save draft
        </button>

        {page.published ? (
          <button
            type="button"
            disabled={busy != null}
            onClick={() => send("unpublish", { published: false })}
            className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-5 text-sm font-medium text-ink transition hover:border-black/30 disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={busy != null}
            onClick={() => send("publish", { title, bodyHtml: body, published: true })}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-ink px-5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
          >
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Save &amp; publish
          </button>
        )}

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </section>
  );
}

function LegalPagesPage() {
  const [pages, setPages] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLegalPages()
      .then(setPages)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load the legal pages."),
      );
  }, []);

  return (
    <div>
      <header>
        <p className="metric-kicker">Investor-facing</p>
        <h2 className="mt-1.5 text-xl font-semibold text-ink md:text-2xl">
          Legal pages
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          The Terms of Use and Privacy Policy the create-account form links to.
          Publish one here and it replaces the external link; leave it
          unpublished and the URL in Settings is used instead.
        </p>
      </header>

      {error ? (
        <div className="mt-6 rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {pages == null && !error ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          (pages || []).map((p) => (
            <PageEditor
              key={p.slug}
              page={p}
              onSaved={(updated) =>
                setPages((all) =>
                  all.map((x) => (x.slug === updated.slug ? updated : x)),
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

export default LegalPagesPage;
