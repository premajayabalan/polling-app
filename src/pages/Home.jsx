import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="fade-up">
        <p className="text-brand-soft text-sm font-body tracking-widest uppercase mb-4">
          For Remote Dev Teams
        </p>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-tight mb-6">
          Quick polls.
          <br />
          <span className="text-brand-accent">Real decisions.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10 font-body">
          Deadlines. Multi-select. Open answers. Decision log. Everything your
          team actually needs — no login required.
        </p>
        <button
          onClick={() => navigate("/create")}
          className="glow-btn text-white font-display font-semibold text-lg px-10 py-4 rounded-2xl"
        >
          Create a Poll →
        </button>
      </div>

      <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full">
        {[
          { icon: "⏰", label: "Voting deadlines" },
          { icon: "✅", label: "Multi-select" },
          { icon: "💬", label: "Open answers" },
          { icon: "📋", label: "Decision log" },
        ].map((f) => (
          <div
            key={f.label}
            className="glass rounded-2xl p-4 text-center fade-up"
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-zinc-300 text-sm font-body">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
