import { useEffect, useState } from "react";
import {
  Briefcase,
  Calculator,
  Download,
  FileText,
  Receipt,
  Scale,
} from "lucide-react";

import {
  fetchPortalDocuments,
  portalDocumentDownloadUrl,
} from "../../../services/investorPortalService";
import { getInvestorAuthToken } from "../../../services/investorApi";

const CATEGORY_META = {
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
    description: "Funding and money-movement instructions.",
    icon: Calculator,
  },
};

const formatBytes = (bytes) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return null;
  }
};

function DocumentRow({ doc }) {
  const handleDownload = async () => {
    const token = getInvestorAuthToken();
    const url = portalDocumentDownloadUrl(doc.id);
    // Use fetch + blob so we can attach the Bearer token; the backend issues
    // a redirect to the actual file URL.
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const finalUrl = response.url || url;
      window.open(finalUrl, "_blank", "noopener");
    } catch (err) {
      // Fallback: open the endpoint directly (browser will receive the redirect).
      window.open(url, "_blank", "noopener");
    }
  };

  return (
    <li className="flex items-center justify-between gap-4 rounded-[14px] border border-black/5 bg-[#fafaf8] px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="rounded-[10px] bg-white p-2 text-[#0f3d3e]">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">
            {doc.subcategory || doc.title}
          </p>
          {doc.subcategory && doc.title !== doc.subcategory ? (
            <p className="truncate text-xs text-[#6b7280]">{doc.title}</p>
          ) : null}
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#9ca3af]">
            {doc.scope === "investor" ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                Personal
              </span>
            ) : null}
            {formatDate(doc.documentDatedAt) ? (
              <span>Dated {formatDate(doc.documentDatedAt)}</span>
            ) : null}
            {formatBytes(doc.sizeBytes) ? <span>· {formatBytes(doc.sizeBytes)}</span> : null}
            {doc.mimeType ? <span>· {doc.mimeType.split("/")[1]?.toUpperCase()}</span> : null}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-soft transition hover:border-black/30"
      >
        <Download className="h-3.5 w-3.5" /> Download
      </button>
    </li>
  );
}

function CategorySection({ category, docs }) {
  const meta = CATEGORY_META[category] || {
    label: category,
    description: "",
    icon: FileText,
  };
  const Icon = meta.icon;

  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex items-start gap-3">
        <div className="rounded-[12px] bg-[#eef5f4] p-2.5 text-[#0f3d3e]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-[20px] leading-tight text-[#111111]">
            {meta.label}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">{meta.description}</p>
        </div>
      </div>

      <div className="mt-5">
        {docs.length === 0 ? (
          <p className="rounded-[12px] bg-[#fafaf8] px-4 py-6 text-center text-sm text-[#9ca3af]">
            No {meta.label.toLowerCase()} documents yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DocumentsPage() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortalDocuments()
      .then(setDocs)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load documents.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading documents…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  const categories = ["legal", "operational", "tax", "financial"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Documents
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Everything signed and shared, grouped by category.
        </p>
      </div>

      {categories.map((cat) => (
        <CategorySection key={cat} category={cat} docs={docs?.[cat] || []} />
      ))}
    </div>
  );
}

export default DocumentsPage;
