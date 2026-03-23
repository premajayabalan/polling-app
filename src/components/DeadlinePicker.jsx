import { useState } from "react";
import { addTime, toDatetimeLocal } from "../utils/helpers";

const END_PRESETS = [
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "1 week", value: "1w" },
  { label: "1 month", value: "1mo" },
  { label: "Never", value: "never" },
  { label: "Custom", value: "custom" },
];

/**
 * props:
 *   startTime        — ISO string | null
 *   endTime          — ISO string | null
 *   onChangeStart(iso | null)
 *   onChangeEnd(iso | null)
 */
export default function DeadlinePicker({
  startTime,
  endTime,
  onChangeStart,
  onChangeEnd,
}) {
  const [endMode, setEndMode] = useState("never");
  const [showStart, setShowStart] = useState(false);

  const handleEndPreset = (preset) => {
    setEndMode(preset);
    if (preset === "never") {
      onChangeEnd(null);
    } else if (preset === "custom") {
      onChangeEnd(endTime || null);
    } else {
      onChangeEnd(addTime(preset));
    }
  };

  const handleStartChange = (e) => {
    const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
    onChangeStart(iso);
  };

  const handleEndChange = (e) => {
    const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
    onChangeEnd(iso);
  };

  const fmt = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (s, e) => {
    const diff = new Date(e) - new Date(s);
    if (diff <= 0) return "Invalid range";
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-4">
      {/* ── Start Time ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-zinc-400 text-xs uppercase tracking-widest font-body">
            Start Time
          </label>
          <button
            type="button"
            onClick={() => setShowStart((v) => !v)}
            className="text-brand-soft text-xs font-body hover:text-brand-glow transition"
          >
            {showStart ? "Hide ↑" : startTime ? "Edit ↓" : "Set start time ↓"}
          </button>
        </div>

        {!showStart && (
          <p className="text-zinc-600 text-xs font-body">
            {startTime
              ? `▶ Opens: ${fmt(startTime)}`
              : "Opens immediately on creation"}
          </p>
        )}

        {showStart && (
          <div className="fade-in space-y-2">
            <input
              type="datetime-local"
              defaultValue={startTime ? toDatetimeLocal(startTime) : ""}
              onChange={handleStartChange}
              className="inp"
              style={{ colorScheme: "dark" }}
            />
            {startTime && (
              <div className="flex items-center justify-between">
                <p className="text-zinc-500 text-xs font-body">
                  ▶ Opens: {fmt(startTime)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onChangeStart(null);
                    setShowStart(false);
                  }}
                  className="text-zinc-600 text-xs font-body hover:text-red-400 transition"
                >
                  Clear
                </button>
              </div>
            )}
            <p className="text-zinc-600 text-xs font-body">
              Voters cannot vote before this time. Leave empty to open
              immediately.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800" />

      {/* ── End Time ────────────────────────────────────────────────── */}
      <div>
        <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
          Voting Closes
        </label>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {END_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => handleEndPreset(p.value)}
              className={`rounded-xl px-3 py-2 text-sm font-body border transition-all
                ${
                  endMode === p.value
                    ? "border-brand-accent bg-brand-accent/10 text-brand-glow"
                    : "border-zinc-700 bg-brand-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {endMode === "custom" && (
          <div className="fade-in space-y-2">
            <input
              type="datetime-local"
              defaultValue={endTime ? toDatetimeLocal(endTime) : ""}
              onChange={handleEndChange}
              min={
                startTime
                  ? toDatetimeLocal(startTime)
                  : toDatetimeLocal(new Date().toISOString())
              }
              className="inp"
              style={{ colorScheme: "dark" }}
            />
            <p className="text-zinc-600 text-xs font-body">
              All participants see time in their local timezone.
            </p>
          </div>
        )}

        {/* Timeline summary */}
        {(startTime || (endTime && endMode !== "never")) && (
          <div className="mt-3 bg-brand-800 rounded-xl px-4 py-3 border border-zinc-700 space-y-1.5">
            {startTime && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <p className="text-zinc-300 text-xs font-body">
                  Opens: {fmt(startTime)}
                </p>
              </div>
            )}
            {endTime && endMode !== "never" && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-zinc-300 text-xs font-body">
                  Closes: {fmt(endTime)}
                </p>
              </div>
            )}
            {startTime && endTime && endMode !== "never" && (
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-700/50">
                <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                <p className="text-zinc-500 text-xs font-body">
                  Duration: {getDuration(startTime, endTime)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
