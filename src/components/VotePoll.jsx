import { useState } from "react";
import { db } from "../firebase/config";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { usePoll } from "../hooks/usePoll";
import { useCountdown } from "../hooks/useCountdown";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ─── Template config ──────────────────────────────────────────────────────
const TEMPLATE_CONFIG = {
  blocker: {
    icon: "🐛",
    accentColor: "#ef4444",
    accentBg: "rgba(239,68,68,0.08)",
    accentBorder: "rgba(239,68,68,0.25)",
    accentText: "#fca5a5",
    tag: "Blocker Priority",
    tagBg: "bg-red-500/10 border-red-500/25 text-red-400",
    hint: "Pick the most critical blocker to unblock the team.",
  },
  sprint: {
    icon: "📅",
    accentColor: "#3b82f6",
    accentBg: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.25)",
    accentText: "#93c5fd",
    tag: "Sprint Planning",
    tagBg: "bg-blue-500/10 border-blue-500/25 text-blue-400",
    hint: "Select features your team will commit to this sprint.",
  },
  release: {
    icon: "🚀",
    accentColor: "#f59e0b",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.25)",
    accentText: "#fcd34d",
    tag: "Release Decision",
    tagBg: "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",
    hint: "Is the team aligned on shipping? Vote honestly.",
  },
  retro: {
    icon: "🔁",
    accentColor: "#8b5cf6",
    accentBg: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.25)",
    accentText: "#c4b5fd",
    tag: "Retro Vote",
    tagBg: "bg-purple-500/10 border-purple-500/25 text-purple-400",
    hint: "What should the team focus on improving?",
  },
  satisfaction: {
    icon: "😊",
    accentColor: "#10b981",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.25)",
    accentText: "#6ee7b7",
    tag: "Team Satisfaction",
    tagBg: "bg-green-500/10 border-green-500/25 text-green-400",
    hint: "Be honest — your feedback shapes the next sprint.",
  },
  openended: {
    icon: "💬",
    accentColor: "#6c63ff",
    accentBg: "rgba(108,99,255,0.08)",
    accentBorder: "rgba(108,99,255,0.25)",
    accentText: "#c4b5fd",
    tag: "Open Feedback",
    tagBg: "bg-brand-accent/10 border-brand-accent/25 text-brand-soft",
    hint: "Share your honest thoughts — all responses are anonymous.",
  },
  default: {
    icon: "📊",
    accentColor: "#6c63ff",
    accentBg: "rgba(108,99,255,0.08)",
    accentBorder: "rgba(108,99,255,0.25)",
    accentText: "#c4b5fd",
    tag: "Team Poll",
    tagBg: "bg-brand-accent/10 border-brand-accent/25 text-brand-soft",
    hint: "Cast your vote below.",
  },
};

const SATISFACTION_EMOJIS = {
  "Very satisfied": "😄",
  Satisfied: "🙂",
  Neutral: "😐",
  Unsatisfied: "😞",
};
const RELEASE_ICONS = {
  "Yes — ship it": "✅",
  "No — needs more testing": "🔬",
  "Partial — ship a hotfix only": "🩹",
};

export default function VotePoll({ pollId }) {
  const { poll, loading } = usePoll(pollId);
  const { label: countdownLabel, expired } = useCountdown(poll?.deadline);
  const [selected, setSelected] = useState([]);
  const [openText, setOpenText] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voted, setVoted] = useState(false);
  const navigate = useNavigate();

  const cfg = poll
    ? TEMPLATE_CONFIG[poll.templateUsed] || TEMPLATE_CONFIG.default
    : TEMPLATE_CONFIG.default;

  const toggleOption = (i) => {
    if (poll.selectionType === "single") {
      setSelected([i]);
    } else {
      setSelected((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
      );
    }
  };

  const needsName =
    poll && poll.anonymity !== "anonymous" && poll.anonymity != null;

  const canSubmit = () => {
    if (!poll) return false;
    if (needsName && !voterName.trim()) return false;
    if (poll.questionType === "open") return openText.trim().length > 0;
    if (poll.selectionType === "single") return selected.length === 1;
    return (
      selected.length >= poll.minSelect && selected.length <= poll.maxSelect
    );
  };

  const handleVote = async () => {
    if (needsName && !voterName.trim())
      return toast.error("Please enter your name!");
    if (!canSubmit()) {
      if (poll.questionType === "open")
        return toast.error("Type your response!");
      if (poll.selectionType === "multiple")
        return toast.error(
          `Select ${poll.minSelect}–${poll.maxSelect} options.`,
        );
      return toast.error("Pick an option!");
    }

    const pollRef = doc(db, "polls", pollId);

    if (poll.questionType === "open") {
      const response = needsName
        ? { name: voterName.trim(), answer: openText.trim() }
        : openText.trim();
      await updateDoc(pollRef, {
        openResponses: arrayUnion(
          typeof response === "string" ? response : response.answer,
        ),
        namedResponses: needsName ? arrayUnion(response) : arrayUnion(),
        totalVotes: increment(1),
      });
    } else {
      const updatedOptions = poll.options.map((o, i) =>
        selected.includes(i) ? { ...o, votes: o.votes + 1 } : o,
      );
      const updates = { options: updatedOptions, totalVotes: increment(1) };
      if (needsName) {
        const selectedLabels = selected
          .map((i) => poll.options[i].label)
          .join(", ");
        updates.namedResponses = arrayUnion({
          name: voterName.trim(),
          answer: selectedLabels,
        });
      }
      await updateDoc(pollRef, updates);
    }

    setVoted(true);
    toast.success("Vote cast!");
    setTimeout(() => navigate(`/results/${pollId}`), 900);
  };

  // ── Loading / not found ──────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 font-body">
        Loading poll...
      </div>
    );
  if (!poll)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 font-body">
        Poll not found.
      </div>
    );

  const isClosed = poll.closed || expired;

  // ── Not yet open (start time in future) ─────────────────────────────────
  const notYetOpen = poll.startTime && new Date(poll.startTime) > new Date();
  if (notYetOpen) {
    const opensAt = new Date(poll.startTime).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div
          className="rounded-3xl p-10 w-full max-w-lg fade-up text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${cfg.accentBorder}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-4xl mb-4">⏳</p>
          <p className="text-zinc-400 font-body text-xs uppercase tracking-widest mb-2">
            Scheduled Poll
          </p>
          <p className="text-white font-display font-bold text-xl mb-3">
            {poll.question}
          </p>
          <div
            className="inline-block px-4 py-2 rounded-xl text-sm font-body mb-4"
            style={{
              background: cfg.accentBg,
              color: cfg.accentText,
              border: `1px solid ${cfg.accentBorder}`,
            }}
          >
            Opens: {opensAt}
          </div>
          <p className="text-zinc-500 text-sm font-body">
            This poll hasn't opened yet. Come back at the scheduled time.
          </p>
        </div>
      </div>
    );
  }

  // ── Closed ───────────────────────────────────────────────────────────────
  if (isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div
          className="rounded-3xl p-10 w-full max-w-lg fade-up text-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${cfg.accentBorder}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-white font-display font-bold text-xl mb-2">
            {poll.question}
          </p>
          <p className="text-zinc-400 font-body text-sm mb-6">
            Voting is closed for this poll.
          </p>
          <button
            onClick={() => navigate(`/results/${pollId}`)}
            className="glow-btn px-8 py-3 rounded-2xl text-white font-display font-semibold text-sm"
          >
            See Results →
          </button>
        </div>
      </div>
    );
  }

  // ── Main vote UI ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div
        className="rounded-3xl p-8 w-full max-w-lg fade-up"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${cfg.accentBorder}`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Tag + countdown row */}
        <div className="flex items-center justify-between mb-5">
          <span
            className={`inline-flex items-center gap-2 text-xs font-body px-3 py-1 rounded-full border ${cfg.tagBg}`}
          >
            <span>{cfg.icon}</span> {cfg.tag}
          </span>
          {poll.deadline && (
            <span
              className={expired ? "countdown-pill" : "countdown-pill green"}
            >
              {countdownLabel}
            </span>
          )}
        </div>

        {/* Question */}
        <h2 className="font-display font-bold text-2xl text-white mb-2 leading-snug">
          {poll.question}
        </h2>
        <p className="text-zinc-500 text-sm font-body mb-5">{cfg.hint}</p>

        {/* Name field if not anonymous */}
        {needsName && (
          <div className="mb-5 fade-in">
            <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
              Your Name{" "}
              {poll.anonymity === "public" && (
                <span className="text-zinc-600 normal-case">
                  (visible to all)
                </span>
              )}
            </label>
            <input
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Enter your name"
              className="inp"
            />
          </div>
        )}

        {/* Multi-select instruction */}
        {poll.selectionType === "multiple" && poll.questionType !== "open" && (
          <div
            className="mb-4 px-4 py-2 rounded-xl text-xs font-body"
            style={{
              background: cfg.accentBg,
              color: cfg.accentText,
              border: `1px solid ${cfg.accentBorder}`,
            }}
          >
            Select{" "}
            {poll.minSelect === poll.maxSelect
              ? `exactly ${poll.minSelect}`
              : `${poll.minSelect}–${poll.maxSelect}`}{" "}
            option{poll.maxSelect !== 1 ? "s" : ""}
          </div>
        )}

        {/* ── Open answer ─────────────────────────────────────────── */}
        {poll.questionType === "open" && (
          <div className="space-y-3">
            <textarea
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
              className="inp"
              style={{ borderColor: openText ? cfg.accentColor : undefined }}
            />
            <p className="text-zinc-600 text-xs font-body">
              {openText.length} characters
            </p>
            <button
              onClick={handleVote}
              disabled={voted}
              className="glow-btn w-full py-4 rounded-2xl text-white font-display font-semibold text-base"
            >
              {voted ? "Redirecting..." : "Submit Response →"}
            </button>
          </div>
        )}

        {/* ── Satisfaction — emoji grid ────────────────────────────── */}
        {poll.questionType !== "open" &&
          poll.templateUsed === "satisfaction" && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {poll.options.map((opt, i) => {
                  const isSelected = selected.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOption(i)}
                      className="rounded-2xl p-5 text-center border transition-all duration-200"
                      style={{
                        background: isSelected
                          ? cfg.accentBg
                          : "rgba(255,255,255,0.03)",
                        borderColor: isSelected
                          ? cfg.accentColor
                          : "rgba(255,255,255,0.08)",
                        transform: isSelected ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      <p className="text-4xl mb-2">
                        {SATISFACTION_EMOJIS[opt.label] || "😐"}
                      </p>
                      <p
                        className={`text-sm font-body ${isSelected ? "text-white" : "text-zinc-400"}`}
                      >
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleVote}
                disabled={voted || !canSubmit()}
                className="glow-btn w-full py-4 rounded-2xl text-white font-display font-semibold text-base"
              >
                {voted ? "Redirecting..." : "Submit Vote →"}
              </button>
            </div>
          )}

        {/* ── Release — icon cards ─────────────────────────────────── */}
        {poll.questionType !== "open" && poll.templateUsed === "release" && (
          <div>
            <div className="space-y-3 mb-5">
              {poll.options.map((opt, i) => {
                const isSelected = selected.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleOption(i)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200"
                    style={{
                      background: isSelected
                        ? cfg.accentBg
                        : "rgba(255,255,255,0.03)",
                      borderColor: isSelected
                        ? cfg.accentColor
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-2xl">
                      {RELEASE_ICONS[opt.label] || "📌"}
                    </span>
                    <span
                      className={`text-sm font-body flex-1 text-left ${isSelected ? "text-white" : "text-zinc-300"}`}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span
                        className="text-xs font-body px-2 py-0.5 rounded-full"
                        style={{
                          background: cfg.accentBg,
                          color: cfg.accentText,
                        }}
                      >
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleVote}
              disabled={voted || !canSubmit()}
              className="glow-btn w-full py-4 rounded-2xl text-white font-display font-semibold text-base"
            >
              {voted ? "Redirecting..." : "Submit Vote →"}
            </button>
          </div>
        )}

        {/* ── Default choice (blocker / sprint / retro / custom) ───── */}
        {poll.questionType !== "open" &&
          poll.templateUsed !== "satisfaction" &&
          poll.templateUsed !== "release" && (
            <div>
              <div className="space-y-2 mb-4">
                {poll.options.map((opt, i) => {
                  const isSelected = selected.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleOption(i)}
                      className="w-full text-left px-5 py-4 rounded-2xl border font-body text-sm transition-all duration-200 flex items-center gap-3"
                      style={{
                        background: isSelected
                          ? cfg.accentBg
                          : "rgba(18,18,26,1)",
                        borderColor: isSelected
                          ? cfg.accentColor
                          : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          borderColor: isSelected ? cfg.accentColor : "#52525b",
                          background: isSelected
                            ? cfg.accentColor
                            : "transparent",
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <circle cx="4" cy="4" r="3" fill="white" />
                          </svg>
                        )}
                      </span>
                      <span style={{ color: isSelected ? "#fff" : "#a1a1aa" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {poll.selectionType === "multiple" && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-body text-zinc-600 mb-1">
                    <span>{selected.length} selected</span>
                    <span>max {poll.maxSelect}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(selected.length / poll.maxSelect) * 100}%`,
                        background: `linear-gradient(90deg, ${cfg.accentColor}, ${cfg.accentText})`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleVote}
                disabled={voted || !canSubmit()}
                className="w-full py-4 rounded-2xl text-white font-display font-semibold text-base transition-all"
                style={{
                  background: canSubmit()
                    ? `linear-gradient(135deg, ${cfg.accentColor}, ${cfg.accentText})`
                    : "#1c1c2e",
                  color: canSubmit() ? "white" : "#52525b",
                  boxShadow: canSubmit()
                    ? `0 0 24px ${cfg.accentColor}55`
                    : "none",
                  cursor: canSubmit() ? "pointer" : "not-allowed",
                }}
              >
                {voted ? "Redirecting..." : "Submit Vote →"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
