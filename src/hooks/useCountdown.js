import { useEffect, useState } from "react";

/**
 * Returns { label, expired, urgent } for a given deadline ISO string.
 * label  — human-readable remaining time  e.g. "2h 14m left"
 * expired — boolean: deadline has passed
 * urgent  — boolean: less than 1 hour remaining
 */
export function useCountdown(deadlineISO) {
  const [state, setState] = useState({
    label: "",
    expired: false,
    urgent: false,
  });

  useEffect(() => {
    if (!deadlineISO) return;

    const tick = () => {
      const diff = new Date(deadlineISO).getTime() - Date.now();
      if (diff <= 0) {
        setState({ label: "Voting closed", expired: true, urgent: false });
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      let label;
      if (h > 24) {
        const d = Math.floor(h / 24);
        label = `${d}d ${h % 24}h left`;
      } else if (h > 0) {
        label = `${h}h ${m}m left`;
      } else if (m > 0) {
        label = `${m}m ${s}s left`;
      } else {
        label = `${s}s left`;
      }
      setState({ label, expired: false, urgent: h < 1 });
    };

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [deadlineISO]);

  return state;
}
