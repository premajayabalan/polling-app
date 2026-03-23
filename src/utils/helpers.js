export function getPercentage(optionVotes, totalVotes) {
  if (!totalVotes || totalVotes === 0) return 0;
  return Math.round((optionVotes / totalVotes) * 100);
}

export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLeadingOption(options) {
  if (!options || options.length === 0) return null;
  return options.reduce((a, b) => (a.votes >= b.votes ? a : b));
}

export function getVoteUrl(pollId) {
  return `${window.location.origin}/vote/${pollId}`;
}

export function getResultsUrl(pollId) {
  return `${window.location.origin}/results/${pollId}`;
}

/** Consensus score: % of votes for the leading option */
export function getConsensusScore(options, totalVotes) {
  if (!totalVotes) return 0;
  const max = Math.max(...options.map((o) => o.votes));
  return Math.round((max / totalVotes) * 100);
}

/** Label for consensus level */
export function getConsensusLabel(score) {
  if (score >= 70)
    return {
      text: "Strong consensus",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/25",
    };
  if (score >= 40)
    return {
      text: "Divided",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/25",
    };
  return {
    text: "No consensus",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/25",
  };
}

/** WhatsApp share URL */
export function getWhatsAppUrl(pollId, question, options) {
  const link = getVoteUrl(pollId);
  const opts = options.map((o, i) => `${i + 1}️⃣ ${o.label || o}`).join("\n");
  const text = `📊 Quick team poll — 2 mins\n\n*${question}*\n\n${opts}\n\nVote here → ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Add hours/days to now */
export function addTime(unit) {
  const now = new Date();
  if (unit === "1h") {
    now.setHours(now.getHours() + 1);
  }
  if (unit === "1d") {
    now.setDate(now.getDate() + 1);
  }
  if (unit === "1w") {
    now.setDate(now.getDate() + 7);
  }
  if (unit === "1mo") {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

/** Format ISO to local datetime-local input value */
export function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
