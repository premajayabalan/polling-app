import { useState, useEffect } from "react";

const TIPS = [
  {
    icon: "📊",
    color: "rgba(124, 58, 237, 0.1)",
    border: "rgba(124, 58, 237, 0.3)",
    title: "Create polls in seconds",
    desc: "Type your question, add options, and get a shareable link instantly. No login needed for voters.",
    hint: "Go to Create Poll and tap the '+' button to get started.",
  },
  {
    icon: "✅",
    color: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
    title: "Single & multi-select voting",
    desc: "Configure polls to allow voters to pick one option or multiple options with min/max selection limits.",
    hint: "Toggle between Single select and Multi-select when building your poll.",
  },
  {
    icon: "💬",
    color: "rgba(124, 58, 237, 0.1)",
    border: "rgba(124, 58, 237, 0.3)",
    title: "Open-ended questions",
    desc: "Don't want preset options? Use Open answer mode — voters type their own free-text response.",
    hint: "Switch Question Type to 'Open answer' for free-form feedback.",
  },
  {
    icon: "⏰",
    color: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    title: "Schedule with start & end times",
    desc: "Set when a poll opens and when voting closes. Voters see a live countdown timer.",
    hint: "Use the Poll Schedule section to set start time and voting deadline.",
  },
  {
    icon: "🎭",
    color: "rgba(14, 165, 233, 0.1)",
    border: "rgba(14, 165, 233, 0.3)",
    title: "Anonymous or named voting",
    desc: "Choose anonymous, ask for name privately, or display names publicly on the results page.",
    hint: "Set Voter Identity when creating your poll.",
  },
  {
    icon: "📋",
    color: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    title: "Standard answer presets",
    desc: "Quickly fill options with built-in presets like Agree/Disagree, Yes/No, Satisfied/Unsatisfied.",
    hint: "Click 'Standard answers' when adding options to your poll.",
  },
  {
    icon: "📈",
    color: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    title: "Live results + consensus score",
    desc: "Results update in real time. A 🟢🟡🔴 consensus score tells you if the team is aligned.",
    hint: "Share the results link — it updates live as votes come in.",
  },
  {
    icon: "💚",
    color: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    title: "Share via WhatsApp",
    desc: "One tap generates a formatted WhatsApp message with your poll question, options and vote link.",
    hint: "Click 'WhatsApp' on the results page to share instantly.",
  },
  {
    icon: "🗂️",
    color: "rgba(124, 58, 237, 0.1)",
    border: "rgba(124, 58, 237, 0.3)",
    title: "My Polls — see all polls",
    desc: "View every poll you've created with vote counts, status (Active/Expired/Closed), and quick actions.",
    hint: "Click 'My Polls' in the navigation bar.",
  },
  {
    icon: "💾",
    color: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    title: "Decision Log",
    desc: "Save important poll results permanently. Review past decisions with vote counts and consensus scores.",
    hint: "Click 'Save Decision' on any results page to log it.",
  },
];

export default function OnboardingInsights() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const isDismissed = localStorage.getItem("sp_tips_dismissed");
    if (!isDismissed) setVisible(true);
  }, []);

  const dismiss = (permanent) => {
    if (permanent) localStorage.setItem("sp_tips_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  const tip = TIPS[index];
  const isLast = index === TIPS.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in transition-all">
      <div
        className="relative w-full max-w-[440px] max-h-[90vh] bg-[#0A0A0A] rounded-[48px] border border-white/10 shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-500 transform scale-100"
        style={{ boxShadow: `0 0 60px ${tip.border}` }}
      >
        {/* Modern Segmented Progress Header */}
        <div className="flex gap-1.5 px-10 pt-10 mb-8">
          {TIPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{
                background: i <= index ? "#8B5CF6" : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="px-10 pb-12 flex flex-col items-center text-center">
          <div className="flex flex-col items-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">
              Quick Insight {index + 1} of {TIPS.length}
            </span>
            <div className="relative">
              {/* Subtle dynamic background glow */}
              <div
                className="absolute inset-0 blur-2xl opacity-40 rounded-full scale-150"
                style={{ background: tip.border }}
              />
              {/* Compact Icon Container (Scaled Down from w-24/h-24) */}
              <div
                className="relative w-16 h-16 flex items-center justify-center text-3xl rounded-[22px] border border-white/5 bg-[#141414] shadow-inner"
                style={{ background: tip.color }}
              >
                <span className="drop-shadow-sm">{tip.icon}</span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white mb-3 px-2">
            {tip.title}
          </h3>

          <p className="text-gray-400 font-medium leading-relaxed mb-8 text-[15px]">
            {tip.desc}
          </p>

          {/* Hint Card */}
          <div className="w-full p-5 rounded-[22px] bg-white/[0.03] border border-white/5 mb-10 text-center">
            <p className="text-sm font-bold text-gray-200">
              <span className="text-purple-400 mr-2">💡</span> {tip.hint}
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="w-full flex gap-4">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all ${
                index === 0
                  ? "opacity-0 pointer-events-none"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Back
            </button>

            <button
              onClick={
                isLast ? () => dismiss(false) : () => setIndex((i) => i + 1)
              }
              className="flex-[2] py-4 rounded-2xl font-black text-sm text-white bg-[#8B5CF6] shadow-lg shadow-purple-500/20 active:scale-[0.97] transition-all hover:bg-[#7C3AED]"
            >
              {isLast ? "Done ✦" : "Next →"}
            </button>
          </div>

          {/* Bottom Dismiss Toggle */}
          <button
            onClick={() => dismiss(true)}
            className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            Don't show quick insights again
          </button>
        </div>

        {/* Top-Right Close Button */}
        <button
          onClick={() => dismiss(false)}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all hover:rotate-90 z-20"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
