import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calculator,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Folder,
  Receipt,
  Scale,
  Search,
} from "lucide-react";

import {
  downloadPortalDocument,
  fetchPortalDocuments,
  openPortalDocument,
} from "../../../services/investorPortalService";

export const CATEGORY_META = {
  legal: {
    label: "Legal",
    description: "Fund agreements, subscription docs, and disclosures.",
    icon: Scale,
  },
  operational: {
    label: "Operational",
    description: "Fund overviews and operational summaries.",
    icon: Briefcase,
  },
  tax: {
    label: "Tax",
    description: "K-1s and tax-related filings, per year.",
    icon: Receipt,
  },
  financial: {
    label: "Financial",
    description: "Capital statements and money-movement instructions.",
    icon: Calculator,
  },
};

const CATEGORIES = ["legal", "operational", "tax", "financial"];

const formatBytes = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US");
  } catch {
    return null;
  }
};

/** "application/pdf" -> "PDF". The column shows a file kind, not a MIME type. */
const typeLabel = (mimeType) => {
  if (!mimeType) return "—";
  const tail = String(mimeType).split("/")[1] || mimeType;
  return tail.split(/[.+-]/).pop().toUpperCase();
};

const yearOf = (iso) => (iso ? String(iso).slice(0, 4) : null);

/**
 * View and download behaviour, shared by the two shapes a document row takes:
 * a table row here, and a list item on the onboarding dashboard, which renders
 * inside a <ul> and so cannot use a <tr>. The behaviour is identical and the
 * markup is not, so the logic lives in a hook rather than being duplicated or
 * forced into one component.
 */
function useDocumentActions(doc) {
  const [busy, setBusy] = useState(null);
  const [rowError, setRowError] = useState(null);

  const run = async (kind, fn) => {
    setBusy(kind);
    setRowError(null);
    try {
      await fn(doc);
    } catch (error) {
      setRowError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not open this document.",
      );
    } finally {
      setBusy(null);
    }
  };

  return {
    busy,
    rowError,
    view: () => run("view", openPortalDocument),
    download: () => run("download", downloadPortalDocument),
  };
}

function ViewButton({ busy, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy != null}
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-black/30 disabled:opacity-50"
    >
      <Eye className="h-3.5 w-3.5" />
      {busy === "view" ? "Opening…" : "View"}
    </button>
  );
}

function DownloadButton({ busy, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy != null}
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#0f3d3e]/25 bg-white px-3 py-1.5 text-xs font-medium text-[#0f3d3e] transition hover:border-[#0f3d3e]/60 disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {busy === "download" ? "Downloading…" : "Download"}
    </button>
  );
}

function DocumentTitle({ doc }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
      <div className="min-w-0">
        <p className="truncate text-[14px] text-[#111111]">
          {doc.subcategory || doc.title}
        </p>
        {doc.subcategory && doc.title !== doc.subcategory ? (
          <p className="truncate text-[12px] text-[#6b7280]">{doc.title}</p>
        ) : null}
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#9ca3af]">
          {doc.scope === "investor" ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              Personal
            </span>
          ) : null}
          {formatBytes(doc.sizeBytes) ? <span>{formatBytes(doc.sizeBytes)}</span> : null}
        </p>
      </div>
    </div>
  );
}

/** Table shape, used by the Documents tab. */
function DocumentTableRow({ doc }) {
  const { busy, rowError, view, download } = useDocumentActions(doc);

  return (
    <>
      <tr className="border-t border-black/5">
        <td className="px-4 py-3">
          <DocumentTitle doc={doc} />
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#64748b]">
          {formatDate(doc.documentDatedAt) || "—"}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#64748b]">
          {typeLabel(doc.mimeType)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right">
          <div className="inline-flex gap-2">
            <ViewButton busy={busy} onClick={view} />
            <DownloadButton busy={busy} onClick={download} />
          </div>
        </td>
      </tr>
      {rowError ? (
        <tr>
          <td colSpan={4} className="px-4 pb-3 text-right text-xs text-red-700">
            {rowError}
          </td>
        </tr>
      ) : null}
    </>
  );
}

/**
 * List shape, used by the onboarding dashboard's document panel, which has no
 * table around it.
 */
export function DocumentRow({ doc }) {
  const { busy, rowError, view, download } = useDocumentActions(doc);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-black/5 bg-[#fafaf8] px-5 py-4">
      <DocumentTitle doc={doc} />
      <div className="inline-flex gap-2">
        <ViewButton busy={busy} onClick={view} />
        <DownloadButton busy={busy} onClick={download} />
      </div>
      {rowError ? (
        <p className="basis-full text-right text-xs text-red-700">{rowError}</p>
      ) : null}
    </li>
  );
}

function CategorySection({ category, docs, filtered, open, onToggle }) {
  const meta = CATEGORY_META[category] || {
    label: category,
    description: "",
    icon: FileText,
  };
  const Icon = meta.icon;

  return (
    <section className="rounded-[22px] border border-black/10 bg-white shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-6 py-5 text-left"
      >
        <span className="rounded-[12px] bg-[#eef5f4] p-2.5 text-[#0f3d3e]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="font-display block text-[20px] leading-tight text-[#111111]">
            {meta.label}
          </span>
          <span className="mt-1 block text-sm text-[#6b7280]">
            {meta.description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {docs.length > 0 ? (
            <span className="rounded-full bg-[#f1f5f4] px-3 py-1 text-[12px] text-[#4b5563]">
              {/* Both counts when a filter is hiding some, so a section that
                  looks empty is distinguishable from one that is. */}
              {filtered.length === docs.length
                ? `${docs.length} document${docs.length === 1 ? "" : "s"}`
                : `${filtered.length} of ${docs.length}`}
            </span>
          ) : null}
          <ChevronDown
            className={`h-5 w-5 text-[#6b7280] transition ${open ? "" : "-rotate-90"}`}
          />
        </span>
      </button>

      {open ? (
        <div className="px-6 pb-6">
          {filtered.length === 0 ? (
            <div className="flex items-start gap-3 rounded-[14px] bg-[#fafaf8] px-5 py-6">
              <Folder className="mt-0.5 h-5 w-5 shrink-0 text-[#9ca3af]" />
              <div>
                <p className="font-display text-[15px] text-[#111111]">
                  {docs.length === 0
                    ? `No ${meta.label.toLowerCase()} documents yet`
                    : `No ${meta.label.toLowerCase()} documents match your filters`}
                </p>
                <p className="mt-0.5 text-[12px] text-[#9ca3af]">
                  {docs.length === 0
                    ? `${meta.label} documents will appear here once available.`
                    : "Clear the search or filters to see them again."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Document</th>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <DocumentTableRow key={doc.id} doc={doc} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-[14px] border border-black/10 bg-white pl-4 pr-10 text-[14px] text-[#111111] outline-none focus:border-[#111111]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
    </div>
  );
}

function DocumentsPage() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    fetchPortalDocuments()
      .then(setDocs)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load documents."),
      )
      .finally(() => setLoading(false));
  }, []);

  const all = useMemo(
    () => CATEGORIES.flatMap((c) => docs?.[c] || []),
    [docs],
  );

  // Years and types come from what was actually returned. A hardcoded list
  // offers filters that match nothing, and omits a year the moment one is added.
  const years = useMemo(
    () =>
      [...new Set(all.map((d) => yearOf(d.documentDatedAt)).filter(Boolean))]
        .sort((a, b) => b.localeCompare(a))
        .map((y) => ({ value: y, label: y })),
    [all],
  );

  const types = useMemo(
    () =>
      [...new Set(all.map((d) => typeLabel(d.mimeType)).filter((t) => t !== "—"))]
        .sort()
        .map((t) => ({ value: t, label: t })),
    [all],
  );

  const matches = (doc) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const haystack = `${doc.title || ""} ${doc.subcategory || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (year && yearOf(doc.documentDatedAt) !== year) return false;
    if (type && typeLabel(doc.mimeType) !== type) return false;
    return true;
  };

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading documents…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  const shown = category ? [category] : CATEGORIES;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,180px)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents by name or keyword..."
            aria-label="Search documents"
            className="h-12 w-full rounded-[14px] border border-black/10 bg-white pl-11 pr-4 text-[14px] text-[#111111] outline-none placeholder:text-[#9ca3af] focus:border-[#111111]"
          />
        </div>
        <Select
          label="All categories"
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map((c) => ({
            value: c,
            label: CATEGORY_META[c].label,
          }))}
        />
        <Select label="All years" value={year} onChange={setYear} options={years} />
        <Select label="All types" value={type} onChange={setType} options={types} />
      </div>

      {shown.map((cat) => {
        const catDocs = docs?.[cat] || [];
        const filtered = catDocs.filter(matches);
        // Open by default, empty ones included: the empty state says which
        // documents will land there, and a collapsed empty section is
        // indistinguishable from a collapsed full one.
        const open = collapsed[cat] ?? true;

        return (
          <CategorySection
            key={cat}
            category={cat}
            docs={catDocs}
            filtered={filtered}
            open={open}
            onToggle={() => setCollapsed((c) => ({ ...c, [cat]: !open }))}
          />
        );
      })}
    </div>
  );
}

export default DocumentsPage;
