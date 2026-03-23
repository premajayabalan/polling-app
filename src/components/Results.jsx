import { useState } from "react";
import { usePoll } from "../hooks/usePoll";
import { useCountdown } from "../hooks/useCountdown";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  getConsensusScore,
  getConsensusLabel,
  getVoteUrl,
  getWhatsAppUrl,
} from "../utils/helpers";

export default function Results({ pollId }) {
  const { poll, loading } = usePoll(pollId);
  const { label: countdownLabel, expired } = useCountdown(poll?.deadline);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 font-body">
        Loading results...
      </div>
    );
  if (!poll)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 font-body">
        Poll not found.
      </div>
    );

  const voteLink = getVoteUrl(pollId);
  const isOpen = poll.questionType === "open";
  const isPublicNamed = poll.anonymity === "public";

  const leading =
    !isOpen && poll.options && poll.options.length
      ? poll.options.reduce((a, b) => (a.votes >= b.votes ? a : b))
      : null;

  const chartData =
    !isOpen && poll.options
      ? poll.options.map((o) => ({
          name: o.label,
          votes: o.votes,
          pct:
            poll.totalVotes > 0
              ? Math.round((o.votes / poll.totalVotes) * 100)
              : 0,
        }))
      : [];

  const consensusScore =
    !isOpen && poll.options && poll.totalVotes > 0
      ? getConsensusScore(poll.options, poll.totalVotes)
      : null;
  const consensusInfo =
    consensusScore !== null ? getConsensusLabel(consensusScore) : null;

  const copyLink = () => {
    navigator.clipboard.writeText(voteLink);
    toast.success("Vote link copied!");
  };

  const saveDecision = async () => {
    if (saved) return;
    try {
      await addDoc(collection(db, "decisions"), {
        pollId,
        question: poll.question,
        winningOption: leading?.label || "Open responses",
        totalVotes: poll.totalVotes,
        consensusScore,
        savedAt: serverTimestamp(),
      });
      setSaved(true);
      toast.success("Decision saved to log!");
    } catch {
      toast.error("Could not save decision.");
    }
  };

  const closePoll = async () => {
    await updateDoc(doc(db, "polls", pollId), { closed: true });
    toast.success("Poll closed.");
  };

  const chartHeight = Math.max(160, (poll.options?.length || 2) * 52);
  const isClosed = poll.closed || expired;

  const savedClass =
    "flex-1 py-3 rounded-2xl text-sm font-display font-semibold transition bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700";
  const saveClass =
    "flex-1 py-3 rounded-2xl text-sm font-display font-semibold transition outline-btn";

  // Format schedule info
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl fade-up space-y-4">
        {/* Main card */}
        <div className="glass rounded-3xl p-8">
          {/* Title row */}
          <div className="flex items-start justify-between mb-1">
            <p className="text-brand-soft text-xs uppercase tracking-widest font-body flex items-center gap-2">
              <span className="live-dot" /> Live Results
            </p>
            {poll.deadline && (
              <span
                className={isClosed ? "countdown-pill" : "countdown-pill green"}
              >
                {poll.closed
                  ? "Closed"
                  : expired
                    ? "Voting closed"
                    : countdownLabel}
              </span>
            )}
          </div>

          <h2 className="font-display font-bold text-2xl text-white mt-2 mb-1">
            {poll.question}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <p className="text-zinc-500 text-sm font-body">
              {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""} so far
            </p>
            {poll.selectionType === "multiple" && (
              <span className="text-xs font-body bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                Multi-select
              </span>
            )}
            {poll.anonymity && poll.anonymity !== "anonymous" && (
              <span className="text-xs font-body bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                {poll.anonymity === "named" ? "🔏 Named" : "👥 Public names"}
              </span>
            )}
          </div>

          {/* Schedule info */}
          {(poll.startTime || poll.deadline) && (
            <div className="mb-5 bg-brand-800 rounded-xl px-4 py-3 border border-zinc-700 space-y-1">
              {poll.startTime && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <p className="text-zinc-400 text-xs font-body">
                    Opened: {fmtDate(poll.startTime)}
                  </p>
                </div>
              )}
              {poll.deadline && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <p className="text-zinc-400 text-xs font-body">
                    {isClosed ? "Closed:" : "Closes:"} {fmtDate(poll.deadline)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Open responses ──────────────────────────────────── */}
          {isOpen && (
            <div className="space-y-2">
              {!poll.openResponses || poll.openResponses.length === 0 ? (
                <p className="text-zinc-600 text-sm font-body text-center py-6">
                  No responses yet. Share the vote link.
                </p>
              ) : (
                <>
                  {/* Named responses */}
                  {isPublicNamed &&
                  poll.namedResponses &&
                  poll.namedResponses.length > 0
                    ? poll.namedResponses.map((r, i) => (
                        <div
                          key={i}
                          className="bg-brand-800 rounded-xl px-4 py-3 border border-zinc-700"
                        >
                          <p className="text-brand-soft text-xs font-display font-semibold mb-1">
                            {r.name}
                          </p>
                          <p className="text-zinc-200 text-sm font-body">
                            "{r.answer}"
                          </p>
                        </div>
                      ))
                    : poll.openResponses.map((r, i) => (
                        <div
                          key={i}
                          className="bg-brand-800 rounded-xl px-4 py-3 border border-zinc-700"
                        >
                          <p className="text-zinc-200 text-sm font-body">
                            "{r}"
                          </p>
                        </div>
                      ))}
                </>
              )}
            </div>
          )}

          {/* ── Bar chart ───────────────────────────────────────── */}
          {!isOpen && (
            <>
              {leading && poll.totalVotes > 0 && (
                <div className="flex items-center gap-2 mb-5 bg-brand-accent/10 border border-brand-accent/25 rounded-xl px-4 py-3">
                  <span className="text-lg">🏆</span>
                  <span className="text-brand-glow text-sm font-body">
                    <strong className="font-display">{leading.label}</strong> is
                    leading
                  </span>
                </div>
              )}

              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 0, right: 24 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{
                      fill: "#a1a1aa",
                      fontSize: 12,
                      fontFamily: "DM Sans",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1c1c2e",
                      border: "1px solid #6c63ff",
                      borderRadius: 12,
                      color: "#f4f4f5",
                      fontFamily: "DM Sans",
                    }}
                    formatter={(v, n, p) => [
                      `${p.payload.pct}% (${v} votes)`,
                      "",
                    ]}
                  />
                  <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          leading &&
                          entry.name === leading.label &&
                          poll.totalVotes > 0
                            ? "#6c63ff"
                            : "#252540"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Named voters table */}
              {isPublicNamed &&
                poll.namedResponses &&
                poll.namedResponses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-zinc-500 text-xs font-body uppercase tracking-widest mb-2">
                      Who voted for what
                    </p>
                    <div className="space-y-1.5">
                      {poll.namedResponses.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-brand-800 rounded-xl px-4 py-2 border border-zinc-700"
                        >
                          <span className="text-brand-soft text-xs font-display font-semibold">
                            {r.name}
                          </span>
                          <span className="text-zinc-300 text-xs font-body">
                            {r.answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Consensus score */}
              {consensusInfo && poll.totalVotes > 0 && (
                <div
                  className={`mt-4 flex items-center gap-3 border rounded-xl px-4 py-3 ${consensusInfo.bg}`}
                >
                  <span className="text-lg">
                    {consensusScore >= 70
                      ? "🟢"
                      : consensusScore >= 40
                        ? "🟡"
                        : "🔴"}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-display font-semibold ${consensusInfo.color}`}
                    >
                      {consensusInfo.text} — {consensusScore}%
                    </p>
                    <p className="text-xs font-body text-zinc-500">
                      {consensusScore >= 70
                        ? "Team is aligned. Proceed with confidence."
                        : consensusScore >= 40
                          ? "Team is divided. Consider a quick discussion."
                          : "No clear consensus. Schedule a meeting before deciding."}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Share row */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <p className="text-zinc-400 text-xs font-body truncate flex-1">
            {voteLink}
          </p>
          <button
            onClick={copyLink}
            className="shrink-0 outline-btn text-xs font-display px-3 py-2 rounded-xl"
          >
            Copy Link
          </button>
          <a
            href={getWhatsAppUrl(pollId, poll.question, poll.options || [])}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-display px-3 py-2 rounded-xl border border-green-600/40 text-green-400 hover:bg-green-600/10 transition"
          >
            WhatsApp
          </a>
        </div>

        {/* Actions row */}
        <div className="flex gap-3">
          <button
            onClick={saveDecision}
            disabled={saved}
            className={saved ? savedClass : saveClass}
          >
            {saved ? "✓ Saved to log" : "Save Decision"}
          </button>
          {!poll.closed && (
            <button
              onClick={closePoll}
              className="flex-1 danger-btn py-3 rounded-2xl text-white text-sm font-display font-semibold"
            >
              Close Voting
            </button>
          )}
        </div>

        <button
          onClick={() => navigate("/create")}
          className="w-full text-center text-zinc-600 text-sm font-body hover:text-zinc-400 transition py-2"
        >
          + Create another poll
        </button>
      </div>
    </div>
  );
}
