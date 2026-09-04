import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
} from "lucide-react";

import {
  fetchAdminThread,
  fetchAdminThreads,
  reopenAdminThread,
  replyToAdminThread,
  resolveAdminThread,
} from "../../services/adminService";

const CATEGORY_LABEL = {
  general: "General question",
  call_request: "Call request",
  documents: "Document query",
};

const STATE = {
  awaiting_team: { label: "Awaiting reply", tone: "bg-amber-50 text-amber-800" },
  awaiting_investor: { label: "Replied", tone: "bg-emerald-50 text-emerald-700" },
  resolved: { label: "Resolved", tone: "bg-gray-100 text-gray-600" },
};

const formatWhen = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

function StateBadge({ state }) {
  const meta = STATE[state];
  if (!meta) return null;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

function ThreadView({ id, onBack, onChanged }) {
  const [thread, setThread] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = () =>
    fetchAdminThread(id)
      .then(setThread)
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load that thread."),
      );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const act = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      setThread(await fn());
      onChanged();
    } catch (err) {
      setError(err?.response?.data?.message || "That didn't go through.");
    } finally {
      setBusy(false);
    }
  };

  const reply = (resolve) => (e) => {
    e.preventDefault();
    if (body.trim() === "") return;
    act(async () => {
      const updated = await replyToAdminThread(id, { body: body.trim(), resolve });
      setBody("");
      return updated;
    });
  };

  if (!thread) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> All messages
        </button>
        <p className="text-sm text-gray-500">{error || "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All messages
      </button>

      <section className="rounded-[22px] border border-black/5 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ink">{thread.subject}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {thread.investorName} · {thread.investorCode} ·{" "}
              {CATEGORY_LABEL[thread.category] || thread.category}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StateBadge state={thread.state} />
            {thread.state === "resolved" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => reopenAdminThread(id))}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 px-3 py-1.5 text-xs font-medium text-ink hover:border-black/30 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reopen
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => resolveAdminThread(id))}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 px-3 py-1.5 text-xs font-medium text-ink hover:border-black/30 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
              </button>
            )}
          </div>
        </div>

        <ol className="mt-6 space-y-4">
          {thread.messages.map((m) => {
            const fromTeam = m.authorType === "admin";
            return (
              <li key={m.id} className={`flex flex-col gap-1 ${fromTeam ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-[16px] px-4 py-3 text-sm leading-6 ${
                    fromTeam ? "bg-ink text-white" : "border border-black/10 bg-[#f7f7f5] text-ink"
                  }`}
                >
                  {m.body}
                  {m.document ? (
                    <span className={`mt-2 block text-xs ${fromTeam ? "text-white/70" : "text-gray-500"}`}>
                      Re: {m.document.title}
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-gray-400">
                  {m.authorName} · {formatWhen(m.createdAt)}
                  {/* Read receipts run one way only: the investor's client is
                      the one that reports back. */}
                  {fromTeam && m.readAt ? " · read" : ""}
                </p>
              </li>
            );
          })}
        </ol>

        <form onSubmit={reply(false)} className="mt-5 border-t border-black/5 pt-5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={5000}
            placeholder="Reply to the investor. This appears in their portal."
            className="w-full rounded-[12px] border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          />
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={body.trim() === "" || busy}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-ink px-5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send reply
            </button>
            <button
              type="button"
              disabled={body.trim() === "" || busy}
              onClick={reply(true)}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-5 text-sm font-medium text-ink transition hover:border-black/30 disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" /> Send &amp; resolve
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/**
 * The team's inbox. Threads awaiting a reply sort first — the portal promises a
 * response within one business day, so the ordering has to answer "what is
 * overdue" before "what is recent".
 */
function SecureMessageInbox() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = () =>
    fetchAdminThreads()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Could not load messages."),
      );

  useEffect(() => {
    load();
  }, []);

  if (openId != null) {
    return (
      <ThreadView
        id={openId}
        onBack={() => {
          setOpenId(null);
          load();
        }}
        onChanged={load}
      />
    );
  }

  return (
    <div className="space-y-3">
      {data?.awaitingTeam > 0 ? (
        <p className="text-sm text-gray-600">
          <strong>{data.awaitingTeam}</strong> thread
          {data.awaitingTeam === 1 ? "" : "s"} awaiting a reply.
        </p>
      ) : null}

      {error ? (
        <div className="rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {data == null ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : data.data.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-black/15 bg-white/60 p-12 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-ink">No secure messages yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Threads investors open in their portal appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.data.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setOpenId(t.id)}
                className="flex w-full items-start gap-4 rounded-[18px] border border-black/5 bg-white p-5 text-left shadow-soft transition hover:border-black/15"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef5f4] text-[#0f3d3e]">
                  <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-medium text-ink">{t.subject}</span>
                    <StateBadge state={t.state} />
                    {t.unread > 0 ? (
                      <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
                        {t.unread} new
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    {t.investorName} · {t.investorCode} ·{" "}
                    {CATEGORY_LABEL[t.category] || t.category}
                  </span>
                  {t.preview ? (
                    <span className="mt-1.5 line-clamp-2 block text-sm text-gray-600">
                      {t.preview}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-xs text-gray-500">{formatWhen(t.lastMessageAt)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SecureMessageInbox;
