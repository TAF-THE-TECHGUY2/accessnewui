import { useEffect, useState } from "react";
import { ArrowLeft, Megaphone, Newspaper } from "lucide-react";

import {
  fetchCommunication,
  fetchCommunications,
} from "../../../services/investorPortalService";

const TYPE_META = {
  update: { label: "Update", icon: Megaphone },
  newsletter: { label: "Newsletter", icon: Newspaper },
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" }) : "";

function CommunicationsListItem({ comm, onOpen }) {
  const meta = TYPE_META[comm.type] || TYPE_META.update;
  const Icon = meta.icon;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(comm.id)}
        className="block w-full rounded-[18px] border border-black/5 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,61,62,0.04)] transition hover:border-black/15"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-[10px] bg-[#eef5f4] p-2 text-[#0f3d3e]">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
              {meta.label} · {formatDate(comm.publishedAt)}
            </p>
            <h3 className="mt-1 font-medium text-ink">{comm.title}</h3>
            {comm.summary ? (
              <p className="mt-1 text-sm text-[#6b7280]">{comm.summary}</p>
            ) : null}
          </div>
        </div>
      </button>
    </li>
  );
}

function CommunicationDetail({ id, onBack }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchCommunication(id)
      .then(setItem)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load the post.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading…</p>;
  }

  if (error || !item) {
    return (
      <div className="rounded-[22px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Post not found."}
      </div>
    );
  }

  const meta = TYPE_META[item.type] || TYPE_META.update;

  return (
    <article className="rounded-[22px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#1f2937]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to all
      </button>
      <p className="mt-5 text-[11px] uppercase tracking-[0.14em] text-[#6b7280]">
        {meta.label} · {formatDate(item.publishedAt)}
      </p>
      <h1 className="font-display mt-2 text-[32px] leading-tight text-[#111111]">
        {item.title}
      </h1>
      {item.summary ? (
        <p className="mt-4 text-base text-[#4b5563]">{item.summary}</p>
      ) : null}
      <div
        className="prose prose-sm mt-6 max-w-none text-[#1f2937]"
        // Server-side admin authors trusted content; sanitize on input rather than output.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: item.body }}
      />
    </article>
  );
}

function CommunicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetchCommunications()
      .then(setItems)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load communications.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-[#6b7280]">Loading…</p>;
  }

  if (openId != null) {
    return <CommunicationDetail id={openId} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[24px] leading-tight text-[#111111]">
          Communications
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Company updates and newsletters from your fund team.
        </p>
      </div>

      {error ? (
        <div className="rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center text-sm text-[#6b7280]">
          No communications yet. We'll send updates here when your fund team posts.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <CommunicationsListItem
              key={c.id}
              comm={c}
              onOpen={(id) => setOpenId(id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommunicationsPage;
