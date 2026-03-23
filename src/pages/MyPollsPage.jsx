import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function MyPollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchPolls = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "polls"), orderBy("createdAt", "desc")),
      );
      setPolls(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Could not load polls.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleDelete = async (pollId) => {
    if (!window.confirm("Delete this poll permanently?")) return;
    setDeleting(pollId);
    try {
      await deleteDoc(doc(db, "polls", pollId));
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      toast.success("Poll deleted.");
    } catch {
      toast.error("Could not delete poll.");
    }
    setDeleting(null);
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (poll) => {
    if (poll.closed)
      return { label: "Closed", cls: "bg-zinc-700 text-zinc-400" };
    if (poll.deadline && new Date(poll.deadline) < new Date())
      return { label: "Expired", cls: "bg-red-500/15 text-red-400" };
    return { label: "Active", cls: "bg-green-500/15 text-green-400" };
  };

  const getTypeLabel = (poll) => {
    if (poll.questionType === "open") return "Open answer";
    if (poll.selectionType === "multiple") return "Multi-select";
    return "Single choice";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 font-body">
        Loading your polls...
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-1">
              My Polls
            </h1>
            <p className="text-zinc-500 text-sm font-body">
              {polls.length} poll{polls.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="glow-btn text-white text-sm font-display font-semibold px-5 py-2.5 rounded-xl"
          >
            + New Poll
          </button>
        </div>

        {/* Empty state */}
        {polls.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-zinc-400 font-body text-sm mb-6">
              No polls yet. Create your first one!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="glow-btn px-8 py-3 rounded-2xl text-white font-display font-semibold text-sm"
            >
              Create a Poll →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((poll) => {
              const status = getStatusBadge(poll);
              return (
                <div
                  key={poll.id}
                  className="glass rounded-2xl p-5 hover:border-zinc-600 transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-body text-sm font-medium leading-snug mb-1 truncate">
                        {poll.question}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status */}
                        <span
                          className={`text-xs font-body px-2 py-0.5 rounded-full ${status.cls}`}
                        >
                          {status.label}
                        </span>
                        {/* Type */}
                        <span className="text-xs font-body text-zinc-600">
                          {getTypeLabel(poll)}
                        </span>
                        {/* Vote count */}
                        <span className="text-xs font-body text-zinc-600">
                          · {poll.totalVotes || 0} vote
                          {poll.totalVotes !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <p className="text-zinc-600 text-xs font-body shrink-0">
                      {formatDate(poll.createdAt)}
                    </p>
                  </div>

                  {/* Options preview (for choice polls) */}
                  {poll.questionType !== "open" && poll.options?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {poll.options.map((o, i) => (
                        <span
                          key={i}
                          className="text-xs font-body bg-brand-800 border border-zinc-700 text-zinc-400 px-2.5 py-1 rounded-lg"
                        >
                          {o.label}
                          {poll.totalVotes > 0 && (
                            <span className="text-zinc-600 ml-1">
                              ({o.votes})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Deadline */}
                  {poll.deadline && (
                    <p className="text-xs font-body text-zinc-600 mb-3">
                      ⏰ Closes:{" "}
                      {new Date(poll.deadline).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/results/${poll.id}`)}
                      className="text-xs font-display font-semibold outline-btn px-3 py-1.5 rounded-lg"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/vote/${poll.id}`,
                        );
                        toast.success("Vote link copied!");
                      }}
                      className="text-xs font-body text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition"
                    >
                      Copy Vote Link
                    </button>
                    <button
                      onClick={() => handleDelete(poll.id)}
                      disabled={deleting === poll.id}
                      className="text-xs font-body text-red-500/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition ml-auto"
                    >
                      {deleting === poll.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
