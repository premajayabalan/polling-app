import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export function usePoll(pollId) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pollId) return;
    const unsub = onSnapshot(doc(db, "polls", pollId), (snap) => {
      if (snap.exists()) {
        setPoll({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [pollId]);

  return { poll, loading };
}
