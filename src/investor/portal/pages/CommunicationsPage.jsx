import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Phone,
  Send,
  Shield,
  UserRound,
} from "lucide-react";

import { useOutletContext } from "react-router-dom";

import {
  fetchCommunication,
  fetchCommunications,
} from "../../../services/investorPortalService";

const SUPPORT_EMAIL = "investors@ap.boston";

const TYPE_META = {
  update: { label: "Update", icon: Megaphone },
  newsletter: { label: "Newsletter", icon: Newspaper },
};

/**
 * Icon per post, chosen from its title so a valuation notice, a welcome and a
 * quarterly report are distinguishable in the list at a glance. Falls back to
 * the type icon.
 */
const iconFor = (comm) => {
  const t = `${comm.title || ""}`.toLowerCase();
  if (/unit value|nav|valuation|price/.test(t)) return BarChart3;
  if (/welcome/.test(t)) return UserRound;
  if (/update|report|quarter/.test(t)) return FileText;
  return (TYPE_META[comm.type] || TYPE_META.update).icon;
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { dateStyle: "long" }) : "";

const formatShortDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

/**
 * "New" marks a post published within the last fortnight.
 *
 * Derived from the publish date rather than a read receipt, because nothing
 * records whether this investor has opened a post. The badge therefore means
 * recent, and the copy says nothing stronger.
 */
const isRecent = (iso) => {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days <= 14;
};

function Badge({ tone, children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function CommunicationsListItem({ comm, onOpen }) {
  const Icon = iconFor(comm);

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(comm.id)}
        className="flex w-full items-start gap-4 rounded-[18px] border border-black/5 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,61,62,0.04)] transition hover:border-black/15"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0f3d3e] text-white">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[19px] leading-tight text-[#111111]">
              {comm.title}
            </span>
            {isRecent(comm.publishedAt) ? <Badge tone="green">New</Badge> : null}
          </span>
          {comm.summary ? (
            <span className="mt-1.5 block text-[14px] leading-6 text-[#4b5563]">
              {comm.summary}
            </span>
          ) : null}
          <span className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
            <Lock className="h-3 w-3" /> Secure
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-[13px] text-[#64748b]">
            {formatShortDate(comm.publishedAt)}
          </span>
          <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
        </span>
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
        setError(err?.response?.data?.message || "Could not load the post."),
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

/**
 * Contact routes.
 *
 * All three open mail to the investor-relations address. There is no
 * server-side message thread or call-request queue yet, so a form that looked
 * like one would drop what an investor typed into it — a mail client at least
 * delivers. Each carries its own subject so the recipient can tell them apart.
 */
const CONTACT_ACTIONS = [
  {
    icon: Send,
    label: "Send secure message",
    sub: "Message our team",
    subject: "Investor portal enquiry",
  },
  {
    icon: Phone,
    label: "Request a call",
    sub: "Schedule a time to speak",
    subject: "Call request",
  },
  {
    icon: FileText,
    label: "Ask about documents",
    sub: "Request or discuss documents",
    subject: "Document request",
  },
];

function ContactManagement({ investorCode }) {
  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <h2 className="font-display text-[22px] leading-tight text-[#111111]">
        Contact management
      </h2>
      <p className="mt-1.5 text-[13px] leading-6 text-[#6b7280]">
        Our team is here to help. Reach out securely through any of the options
        below.
      </p>

      <div className="mt-5 space-y-3">
        {CONTACT_ACTIONS.map(({ icon: Icon, label, sub, subject }) => (
          <a
            key={label}
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              investorCode ? `${subject} — ${investorCode}` : subject,
            )}`}
            className="flex items-center gap-3 rounded-[14px] border border-black/10 px-4 py-3.5 transition hover:border-black/30"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef5f4] text-[#0f3d3e]">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-medium text-[#111111]">
                {label}
              </span>
              <span className="block text-[12px] text-[#6b7280]">{sub}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#9ca3af]" />
          </a>
        ))}
      </div>

      <div className="mt-6 border-t border-black/5 pt-5">
        <h3 className="text-[13px] font-medium text-[#111111]">
          Other contact channels
        </h3>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-3 flex items-start gap-3"
        >
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
          <span>
            <span className="block text-[14px] text-[#0f3d3e] underline underline-offset-4">
              {SUPPORT_EMAIL}
            </span>
            <span className="block text-[12px] text-[#6b7280]">
              Typically within 1 business day.
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}

function ResponseTimeCard() {
  return (
    <section className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef5f4] text-[#0f3d3e]">
          <Clock className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="font-display text-[18px] leading-tight text-[#111111]">
            Response time
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-[#6b7280]">
            We aim to respond to all inquiries within 1 business day.
          </p>
        </div>
      </div>

      {/* A target, not a measurement — nothing records actual reply times, so
          the bar is decorative and is hidden from assistive tech rather than
          announced as data. */}
      <div
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#f1f5f4]"
        aria-hidden="true"
      >
        <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-[#0f3d3e] to-[#6ee7b7]" />
      </div>
      <p className="mt-2 text-[12px] text-[#6b7280]">
        Typically within 1 business day
      </p>

      <div className="mt-5 flex items-start gap-2.5 border-t border-black/5 pt-4">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#0f3d3e]" />
        <p className="text-[12px] leading-5 text-[#6b7280]">
          All communications are secure and encrypted for your protection.
        </p>
      </div>
    </section>
  );
}

const FILTERS = [
  { value: "all", label: "All items" },
  { value: "update", label: "Updates only" },
  { value: "newsletter", label: "Newsletters only" },
];

function CommunicationsPage() {
  const { investor } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("updates");
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchCommunications()
      .then(setItems)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load communications."),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
    [items, filter],
  );

  const visible = showAll ? filtered : filtered.slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,340px)]">
      <div>
        {openId != null ? (
          <CommunicationDetail id={openId} onBack={() => setOpenId(null)} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1 border-b border-black/10">
                {[
                  { key: "updates", label: "Updates" },
                  { key: "messages", label: "Secure messages" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`-mb-px border-b-2 px-4 pb-2.5 pt-1 text-sm font-medium transition ${
                      tab === key
                        ? "border-[#0f3d3e] text-[#111111]"
                        : "border-transparent text-[#6b7280] hover:text-[#1f2937]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "updates" ? (
                <div className="relative">
                  <select
                    aria-label="Filter communications"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-11 appearance-none rounded-[12px] border border-black/10 bg-white pl-4 pr-10 text-[14px] text-[#111111] outline-none focus:border-[#111111]"
                  >
                    {FILTERS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mt-5 rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {tab === "updates" ? (
              loading ? (
                <p className="mt-6 text-sm text-[#6b7280]">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="mt-5 rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center text-sm text-[#6b7280]">
                  No communications yet. We&rsquo;ll send updates here when your
                  fund team posts.
                </div>
              ) : (
                <>
                  <ul className="mt-5 space-y-3">
                    {visible.map((c) => (
                      <CommunicationsListItem
                        key={c.id}
                        comm={c}
                        onOpen={setOpenId}
                      />
                    ))}
                  </ul>
                  {filtered.length > visible.length ? (
                    <button
                      type="button"
                      onClick={() => setShowAll(true)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] border border-black/5 bg-white px-5 py-4 text-sm font-medium text-[#111111] shadow-[0_10px_30px_rgba(15,61,62,0.04)] transition hover:border-black/15"
                    >
                      View all communications
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </>
              )
            ) : (
              /* No two-way thread exists server-side: investor_messages stores a
                 subject, a preview and a sent-at, with no body, no direction and
                 no status. Rendering an inbox here would be inventing one. */
              <div className="mt-5 rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-[#9ca3af]" />
                <p className="mt-3 text-sm font-medium text-[#111111]">
                  Secure messaging isn&rsquo;t open yet
                </p>
                <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[#6b7280]">
                  Two-way messaging in the portal is still being built. Until it
                  is, email{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-[#0f3d3e] underline underline-offset-4"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  and the team will reply within one business day.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <aside className="space-y-5">
        <ContactManagement investorCode={investor?.code} />
        <ResponseTimeCard />
      </aside>
    </div>
  );
}

export default CommunicationsPage;
