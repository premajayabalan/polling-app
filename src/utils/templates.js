/**
 * Pre-built templates for common dev team scenarios.
 * selectionType: "single" | "multiple"
 * questionType:  "choice" | "open"
 * options: array of strings (labels)
 * standardAnswers: shortcut preset
 */
export const POLL_TEMPLATES = [
  {
    id: "blocker",
    icon: "🐛",
    name: "Blocker Priority",
    question: "Which blocker should we tackle first?",
    questionType: "choice",
    selectionType: "single",
    options: [
      "Fix the login bug",
      "Resolve API timeout",
      "Update broken dependencies",
      "Review failing CI pipeline",
    ],
  },
  {
    id: "sprint",
    icon: "📅",
    name: "Sprint Planning",
    question: "Which features go into this sprint?",
    questionType: "choice",
    selectionType: "multiple",
    minSelect: 1,
    maxSelect: 3,
    options: [
      "User authentication",
      "Dashboard charts",
      "Export to CSV",
      "Notification system",
    ],
  },
  {
    id: "release",
    icon: "🚀",
    name: "Release Decision",
    question: "Are we ready to ship this release?",
    questionType: "choice",
    selectionType: "single",
    options: [
      "Yes — ship it",
      "No — needs more testing",
      "Partial — ship a hotfix only",
    ],
  },
  {
    id: "retro",
    icon: "🔁",
    name: "Retro Vote",
    question: "What should we improve next sprint?",
    questionType: "choice",
    selectionType: "multiple",
    minSelect: 1,
    maxSelect: 2,
    options: [
      "Code review process",
      "Testing coverage",
      "Communication in standups",
      "Documentation",
    ],
  },
  {
    id: "satisfaction",
    icon: "😊",
    name: "Team Satisfaction",
    question: "How satisfied are you with the current sprint pace?",
    questionType: "choice",
    selectionType: "single",
    options: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied"],
  },
  {
    id: "openended",
    icon: "💬",
    name: "Open Feedback",
    question: "What's one thing we should do differently?",
    questionType: "open",
    selectionType: "single",
    options: [],
  },
];

/** Standard answer presets (like the competitor app) */
export const STANDARD_ANSWERS = [
  { id: "agree2", label: "Agree / Disagree", options: ["Agree", "Disagree"] },
  {
    id: "agree3",
    label: "Agree / Disagree / Undecided",
    options: ["Agree", "Disagree", "Undecided"],
  },
  { id: "yesno", label: "Yes / No", options: ["Yes", "No"] },
  {
    id: "yesnoidk",
    label: "Yes / No / Maybe",
    options: ["Yes", "No", "Maybe"],
  },
  {
    id: "satisfaction",
    label: "Satisfied / Unsatisfied",
    options: ["Satisfied", "Unsatisfied"],
  },
  {
    id: "priority",
    label: "High / Medium / Low",
    options: ["High priority", "Medium priority", "Low priority"],
  },
];
