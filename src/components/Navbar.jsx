import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLink = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className={`text-sm font-body px-3 py-2 transition ${
        location.pathname === path
          ? "text-brand-soft"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-brand-900/80">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="font-display font-bold text-xl text-white tracking-tight"
      >
        Sprint<span className="text-brand-accent">Poll</span>
      </button>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLink("/my-polls", "My Polls")}
        {navLink("/history", "Decision Log")}

        {isHome ? (
          <button
            onClick={() => navigate("/create")}
            className="glow-btn text-white text-sm font-display font-semibold px-5 py-2 rounded-xl ml-2"
          >
            Create Poll
          </button>
        ) : (
          <button
            onClick={() => navigate("/create")}
            className="outline-btn text-sm font-display font-semibold px-4 py-2 rounded-xl ml-2"
          >
            + New Poll
          </button>
        )}
      </div>
    </nav>
  );
}
