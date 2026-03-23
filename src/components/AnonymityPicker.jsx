/**
 * AnonymityPicker — from competitor app image
 * 3 modes:
 *   "anonymous"   — no name asked (default)
 *   "named"       — ask for name, only creator sees it
 *   "public"      — ask for name, display to everyone on results
 *
 * props:
 *   value: "anonymous" | "named" | "public"
 *   onChange(value)
 */

const OPTIONS = [
  {
    value: "anonymous",
    label: "Anonymous",
    desc: "No name asked. Full privacy.",
    icon: "🎭",
  },
  {
    value: "named",
    label: "Ask for name",
    desc: "Name collected, only you see it.",
    icon: "🔏",
  },
  {
    value: "public",
    label: "Show names",
    desc: "Names visible to all on results.",
    icon: "👥",
  },
];

export default function AnonymityPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
        Voter Identity
      </label>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-xl px-3 py-3 text-center border transition-all flex flex-col items-center gap-1.5
                ${
                  isActive
                    ? "border-brand-accent bg-brand-accent/10"
                    : "border-zinc-700 bg-brand-800 hover:border-zinc-500"
                }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span
                className={`text-xs font-display font-semibold ${isActive ? "text-brand-glow" : "text-zinc-300"}`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description of selected mode */}
      <p className="text-zinc-500 text-xs font-body pt-1">
        {OPTIONS.find((o) => o.value === value)?.desc}
      </p>
    </div>
  );
}
