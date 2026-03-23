import { STANDARD_ANSWERS } from "../utils/templates";

/**
 * props:
 *   onSelect(options: string[])
 */
export default function StandardAnswerPicker({ onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-zinc-500 text-xs font-body uppercase tracking-widest">
        Standard answer sets
      </p>
      {STANDARD_ANSWERS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.options)}
          className="w-full text-left px-4 py-3 rounded-xl border border-zinc-700 bg-brand-800 hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all group"
        >
          <p className="text-zinc-300 text-sm font-body group-hover:text-white transition">
            {s.label}
          </p>
          <p className="text-zinc-600 text-xs font-body mt-0.5">
            {s.options.join(" · ")}
          </p>
        </button>
      ))}
    </div>
  );
}
