// import { useParams } from "react-router-dom";
// import VotePoll from "../components/VotePoll";
// export default function VotePage() {
//   const { pollId } = useParams();
//   return <VotePoll pollId={pollId} />;
// }

import { useParams } from "react-router-dom";
import VotePoll from "../components/VotePoll";
export default function VotePage() {
  const { pollId } = useParams();
  return <VotePoll pollId={pollId} />;
}