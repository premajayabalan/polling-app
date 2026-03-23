import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getConsensusLabel } from "../utils/helpers";

export default function HistoryPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "decisions"), orderBy("savedAt", "desc")),
        );
        setDecisions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 font-body">
        Loading decision log...
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="fade-up">
        <h1 className="font-display font-bold text-3xl text-white mb-2">
          Decision Log
        </h1>
        <p className="text-zinc-500 text-sm font-body mb-8">
          Every poll decision your team has saved, in order.
        </p>

        {decisions.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-zinc-400 font-body text-sm mb-4">
              No decisions saved yet. After a poll ends, click "Save Decision"
              on the results page.
            </p>
            <button
              onClick={() => navigate("/create")}
              className="glow-btn px-6 py-3 rounded-2xl text-white font-display font-semibold text-sm"
            >
              Create first poll →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((d, i) => {
              const ci =
                d.consensusScore !== null && d.consensusScore !== undefined
                  ? getConsensusLabel(d.consensusScore)
                  : null;
              return (
                <div key={d.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-zinc-500 text-xs font-body mb-1">
                        #{decisions.length - i} ·{" "}
                        {d.savedAt?.toDate
                          ? d.savedAt.toDate().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                      <p className="text-white font-body text-sm mb-2">
                        {d.question}
                      </p>
                      <p className="text-brand-glow text-sm font-display font-semibold">
                        → {d.winningOption}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-zinc-600 text-xs font-body">
                        {d.totalVotes} votes
                      </p>
                      {ci && (
                        <p className={`text-xs font-body mt-1 ${ci.color}`}>
                          {d.consensusScore}% consensus
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/results/${d.pollId}`)}
                    className="mt-3 text-brand-soft text-xs font-body hover:text-brand-glow transition"
                  >
                    View results →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
