// import { useParams } from "react-router-dom";
// import Results from "../components/Results";
// export default function ResultsPage() {
//   const { pollId } = useParams();
//   return <Results pollId={pollId} />;
// }

import { useParams } from "react-router-dom";
import Results from "../components/Results";
export default function ResultsPage() {
  const { pollId } = useParams();
  return <Results pollId={pollId} />;
}

