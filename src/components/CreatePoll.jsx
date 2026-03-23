import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DeadlinePicker from "./DeadlinePicker";
import StandardAnswerPicker from "./StandardAnswerPicker";
import AnonymityPicker from "./AnonymityPicker";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("choice");
  const [selectionType, setSelectionType] = useState("single");
  const [minSelect, setMinSelect] = useState(1);
  const [maxSelect, setMaxSelect] = useState(2);
  const [options, setOptions] = useState(["", ""]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [anonymity, setAnonymity] = useState("anonymous");
  const [showStandard, setShowStandard] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };
  const updateOption = (i, val) => {
    const u = [...options];
    u[i] = val;
    setOptions(u);
  };
  const removeOption = (i) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };
  const applyStandard = (opts) => {
    setOptions(opts);
    setShowStandard(false);
  };

  const handleSubmit = async () => {
    if (!question.trim()) return toast.error("Add a question!");
    if (questionType === "choice" && options.some((o) => !o.trim()))
      return toast.error("Fill all options!");
    if (questionType === "choice" && options.filter((o) => o.trim()).length < 2)
      return toast.error("Add at least 2 options!");
    if (startTime && endTime && new Date(endTime) <= new Date(startTime))
      return toast.error("End time must be after start time!");

    setLoading(true);
    try {
      const pollOptions =
        questionType === "open"
          ? []
          : options
              .filter((o) => o.trim())
              .map((o) => ({ label: o.trim(), votes: 0 }));

      const docRef = await addDoc(collection(db, "polls"), {
        question: question.trim(),
        questionType,
        selectionType,
        minSelect: selectionType === "multiple" ? minSelect : 1,
        maxSelect: selectionType === "multiple" ? maxSelect : 1,
        options: pollOptions,
        openResponses: [],
        namedResponses: [],
        totalVotes: 0,
        startTime: startTime || null,
        deadline: endTime || null,
        anonymity,
        createdAt: serverTimestamp(),
        closed: false,
        templateUsed: null,
      });

      toast.success("Poll created!");
      navigate(`/results/${docRef.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Check Firebase config.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="glass rounded-3xl p-8 w-full max-w-lg fade-up space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-bold text-3xl text-white mb-1">
            New Poll
          </h2>
          <p className="text-zinc-500 text-sm font-body">
            Configure your question below.
          </p>
        </div>

        {/* Accent divider */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, #6c63ff44, transparent)",
          }}
        />

        {/* Question type toggle */}
        <div>
          <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
            Question Type
          </label>
          <div className="flex gap-1 p-1 bg-brand-800 rounded-xl border border-zinc-700">
            {[
              { v: "choice", label: "Multiple choice" },
              { v: "open", label: "Open answer" },
            ].map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setQuestionType(t.v)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-body transition-all ${
                  questionType === t.v ? "seg-active" : "seg-inactive"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {questionType === "open" && (
            <div className="mt-2 flex items-start gap-2 bg-brand-accent/5 rounded-xl px-3 py-2 border border-brand-accent/20">
              <span className="text-lg">💬</span>
              <p className="text-zinc-400 text-xs font-body">
                Voters type a free-text response. No preset options needed.
              </p>
            </div>
          )}
        </div>

        {/* Question input */}
        <div>
          <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
            Question
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              questionType === "open"
                ? "e.g. What's one thing we should do differently?"
                : "e.g. Which blocker should we tackle first?"
            }
            className="inp"
          />
        </div>

        {/* Options — choice only */}
        {questionType === "choice" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-400 text-xs uppercase tracking-widest font-body">
                Options
              </label>
              <button
                type="button"
                onClick={() => setShowStandard((v) => !v)}
                className="text-brand-soft text-xs font-body hover:text-brand-glow transition"
              >
                {showStandard ? "Hide presets ↑" : "Standard answers ↓"}
              </button>
            </div>

            {showStandard && (
              <div className="mb-4 fade-in">
                <StandardAnswerPicker onSelect={applyStandard} />
              </div>
            )}

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-zinc-600 text-xs font-body w-5 shrink-0 text-right">
                    {i + 1}.
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="inp"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-zinc-600 hover:text-red-400 transition px-1 text-base shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-brand-soft text-sm font-body hover:text-white transition"
              >
                + Add option
              </button>
            )}
          </div>
        )}

        {/* Selection type — choice only */}
        {questionType === "choice" && (
          <div>
            <label className="text-zinc-400 text-xs uppercase tracking-widest font-body block mb-2">
              Answer Selection
            </label>
            <div className="flex gap-1 p-1 bg-brand-800 rounded-xl border border-zinc-700 mb-3">
              {["single", "multiple"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectionType(t)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-body capitalize transition-all ${
                    selectionType === t ? "seg-active" : "seg-inactive"
                  }`}
                >
                  {t === "single" ? "Single select" : "Multi-select"}
                </button>
              ))}
            </div>

            {selectionType === "multiple" && (
              <div className="flex gap-3 fade-in">
                <div className="flex-1">
                  <label className="text-zinc-500 text-xs font-body block mb-1">
                    Min selections
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={maxSelect}
                    value={minSelect}
                    onChange={(e) => setMinSelect(Number(e.target.value))}
                    className="inp"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-zinc-500 text-xs font-body block mb-1">
                    Max selections
                  </label>
                  <input
                    type="number"
                    min={minSelect}
                    max={options.length}
                    value={maxSelect}
                    onChange={(e) => setMaxSelect(Number(e.target.value))}
                    className="inp"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anonymity */}
        <AnonymityPicker value={anonymity} onChange={setAnonymity} />

        {/* Schedule */}
        <div className="glass rounded-2xl p-5 border border-zinc-700/50">
          <p className="text-zinc-400 text-xs uppercase tracking-widest font-body mb-4">
            Poll Schedule
          </p>
          <DeadlinePicker
            startTime={startTime}
            endTime={endTime}
            onChangeStart={setStartTime}
            onChangeEnd={setEndTime}
          />
        </div>

        {/* Live preview */}
        {question.trim() && (
          <div className="bg-brand-800 rounded-xl px-4 py-3 border border-zinc-700">
            <p className="text-zinc-500 text-xs font-body mb-1 uppercase tracking-widest">
              Preview
            </p>
            <p className="text-white text-sm font-body">{question}</p>
            {questionType === "choice" &&
              options.filter((o) => o.trim()).length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {options
                    .filter((o) => o.trim())
                    .map((o, i) => (
                      <span
                        key={i}
                        className="text-xs font-body bg-brand-700 text-zinc-400 px-2 py-0.5 rounded-full"
                      >
                        {o}
                      </span>
                    ))}
                </div>
              )}
            <div className="flex gap-3 mt-2 text-xs font-body text-zinc-600">
              <span>
                {anonymity === "anonymous"
                  ? "🎭 Anonymous"
                  : anonymity === "named"
                    ? "🔏 Named"
                    : "👥 Public names"}
              </span>
              {endTime && <span>⏰ Has deadline</span>}
              {startTime && <span>▶ Scheduled start</span>}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="glow-btn w-full py-4 rounded-2xl text-white font-display font-semibold text-base"
        >
          {loading ? "Creating..." : "Create & Get Link →"}
        </button>
      </div>
    </div>
  );
}
