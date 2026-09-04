import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";

import {
  createThread,
  fetchThread,
  fetchThreads,
  replyToThread,
} from "../../../services/investorPortalService";

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "call_request", label: "Request a call" },
  { value: "documents", label: "About a document" },
];

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

const formatWhen = (iso) => {
  if (!iso) return "";
  const then = new Date(iso);
  const days = (Date.now() - then.getTime()) / 86_400_000;
  // Same-week messages read better as a time than a date, and older ones read
  // better as a date than "9 days ago".
  return days < 1
    ? then.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : then.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: days > 300 ? "numeric" : undefined,
      });
};

/**
 * The waiting state, in the investor's own terms.
 *
 * The API calls it awaiting_team; from this side of the screen the useful
 * framing is who owes whom, so it reads as "Awaiting response" when the team
 * has it and "Replied" when they have answered.
 */
function StateBadge({ state }) {
  const tone = {
    awaiting_team: "bg-amber-50 text-amber-800",
    awaiting_investor: "bg-emerald-50 text-emerald-700",
    resolved: "bg-[#f1f5f4] text-[#4b5563]",
  }[state];

  const label = {
    awaiting_team: "Awaiting response",
    awaiting_investor: "Replied",
    resolved: "Resolved",
  }[state];

  if (!label) return null;

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone}`}>
      {label}
    </span>
  );
}

function Compose({ initialCategory, onSent, onCancel }) {
  const [form, setForm] = useState({
    subject: "",
    category: initialCategory || "general",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const valid = form.subject.trim() !== "" && form.body.trim() !== "";

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    setError(null);
    try {
      const thread = await createThread({
        subject: form.subject.trim(),
        body: form.body.trim(),
        category: form.category,
      });
      onSent(thread);
    } catch (err) {
      const fieldError = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setError(
        fieldError ||
          err?.response?.data?.message ||
          "Could not send that. Nothing has been sent, so your message is still here.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[20px] leading-tight text-[#111111]">
          New secure message
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[#6b7280] hover:text-[#111111]"
        >
          Cancel
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
            Subject
          </span>
          <input
            name="subject"
            value={form.subject}
            onChange={change}
            maxLength={200}
            placeholder="Adding to my position"
            className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 px-3 text-sm outline-none focus:border-teal-600"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
            Topic
          </span>
          <select
            name="category"
            value={form.category}
            onChange={change}
            className="mt-1.5 h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm outline-none focus:border-teal-600"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
          Message
        </span>
        <textarea
          name="body"
          value={form.body}
          onChange={change}
          rows={5}
          maxLength={5000}
          className="mt-1.5 w-full rounded-[12px] border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!valid || sending}
          className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-black px-5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending…" : "Send securely"}
        </button>
        <p className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
          <Lock className="h-3 w-3" /> The team typically replies within 1
          business day.
        </p>
      </div>
    </form>
  );
}

function ThreadDetail({ id, onBack, onChanged }) {
  const [thread, setThread] = useState(null);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchThread(id)
      .then((t) => {
        if (!cancelled) setThread(t);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? "That conversation is no longer available."
              : err?.response?.data?.message || "Could not load that conversation.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const send = async (e) => {
    e.preventDefault();
    if (body.trim() === "") return;
    setSending(true);
    setError(null);
    try {
      const updated = await replyToThread(id, { body: body.trim() });
      setThread(updated);
      setBody("");
      onChanged();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not send that reply. Your message is still here.",
      );
    } finally {
      setSending(false);
    }
  };

  if (error && !thread) {
    return (
      <div className="space-y-4">
        <BackButton onClick={onBack} />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!thread) {
    return <p className="text-sm text-[#6b7280]">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      <article className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(15,61,62,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[24px] leading-tight text-[#111111]">
              {thread.subject}
            </h2>
            <p className="mt-1 text-[12px] text-[#6b7280]">
              {CATEGORY_LABEL[thread.category] || thread.category}
            </p>
          </div>
          <StateBadge state={thread.state} />
        </div>

        <ol className="mt-6 space-y-4">
          {thread.messages.map((m) => {
            const mine = m.authorType === "investor";
            return (
              <li
                key={m.id}
                className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[16px] px-4 py-3 text-[14px] leading-6 ${
                    mine
                      ? "bg-[#0f3d3e] text-white"
                      : "border border-black/10 bg-[#f7f7f5] text-[#1f2937]"
                  }`}
                >
                  {m.body}
                  {m.document ? (
                    <span
                      className={`mt-2 block text-[12px] ${
                        mine ? "text-white/70" : "text-[#6b7280]"
                      }`}
                    >
                      Re: {m.document.title}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-[#9ca3af]">
                  {m.authorName} · {formatWhen(m.createdAt)}
                </p>
              </li>
            );
          })}
        </ol>

        {thread.state === "resolved" ? (
          <p className="mt-5 flex items-start gap-2 rounded-[14px] bg-[#f1f5f4] px-4 py-3 text-[13px] leading-6 text-[#4b5563]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            The team marked this resolved. Replying reopens it.
          </p>
        ) : null}

        <form onSubmit={send} className="mt-5 border-t border-black/5 pt-5">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
              Reply
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={5000}
              className="mt-1.5 w-full rounded-[12px] border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
            />
          </label>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={body.trim() === "" || sending}
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-[12px] bg-black px-5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send reply"}
          </button>
        </form>
      </article>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#1f2937]"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to messages
    </button>
  );
}

/**
 * The Secure messages tab.
 *
 * `composeFor` lets the Contact management sidebar open this straight into a
 * pre-picked topic, so "Request a call" is one click rather than a compose form
 * the investor has to categorise themselves.
 */
function SecureMessages({ composeFor, onComposeHandled }) {
  const [threads, setThreads] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [composing, setComposing] = useState(null);

  const load = () =>
    fetchThreads()
      .then((list) => {
        setThreads(list);
        setError(null);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load your messages."),
      );

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (composeFor) {
      setOpenId(null);
      setComposing(composeFor);
      onComposeHandled?.();
    }
  }, [composeFor, onComposeHandled]);

  if (composing) {
    return (
      <div className="mt-5">
        <Compose
          initialCategory={composing}
          onCancel={() => setComposing(null)}
          onSent={(thread) => {
            setComposing(null);
            load();
            setOpenId(thread.id);
          }}
        />
      </div>
    );
  }

  if (openId != null) {
    return (
      <div className="mt-5">
        <ThreadDetail id={openId} onBack={() => { setOpenId(null); load(); }} onChanged={load} />
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={() => setComposing("general")}
        className="inline-flex items-center gap-2 rounded-[12px] bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1f2937]"
      >
        <Plus className="h-4 w-4" /> New message
      </button>

      {error ? (
        <div className="rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {threads == null ? (
        <p className="text-sm text-[#6b7280]">Loading…</p>
      ) : threads.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-[#9ca3af]" />
          <p className="mt-3 text-sm font-medium text-[#111111]">
            No messages yet
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[#6b7280]">
            Start a conversation with your fund team and it will appear here.
            Replies typically arrive within 1 business day.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setOpenId(t.id)}
                className="flex w-full items-start gap-4 rounded-[18px] border border-black/5 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,61,62,0.04)] transition hover:border-black/15"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0f3d3e] text-white">
                  <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[19px] leading-tight text-[#111111]">
                      {t.subject}
                    </span>
                    <StateBadge state={t.state} />
                    {t.unread > 0 ? (
                      <span className="rounded-full bg-[#0f3d3e] px-2 py-0.5 text-[11px] font-medium text-white">
                        {t.unread} new
                      </span>
                    ) : null}
                  </span>
                  {t.preview ? (
                    <span className="mt-1.5 line-clamp-2 block text-[14px] leading-6 text-[#4b5563]">
                      {t.preview}
                    </span>
                  ) : null}
                  <span className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                    <Lock className="h-3 w-3" /> Secure message ·{" "}
                    {t.messageCount} message{t.messageCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[13px] text-[#64748b]">
                    {formatWhen(t.lastMessageAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SecureMessages;
