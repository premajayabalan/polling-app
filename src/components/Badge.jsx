export default function Badge({ label, variant = "leading" }) {
  const styles = {
    leading: "bg-brand-accent/10 border-brand-accent/30 text-brand-glow",
    info: "bg-zinc-800 border-zinc-700 text-zinc-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  };
  const icons = { leading: "🏆", info: "ℹ️", warning: "⚠️" };

  return (
    <div
      className={`inline-flex items-center gap-2 border rounded-xl px-4 py-2 text-sm font-body ${styles[variant]}`}
    >
      <span>{icons[variant]}</span>
      <span>{label}</span>
    </div>
  );
}
