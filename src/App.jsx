import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreatePage from "./pages/CreatePage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";
import MyPollsPage from "./pages/MyPollsPage";
import Navbar from "./components/Navbar";
import OnboardingTips from "./components/OnboardingTips";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <OnboardingTips />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1c1c2e",
            color: "#f4f4f5",
            border: "1px solid #6c63ff",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
          },
        }}
      />
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/vote/:pollId" element={<VotePage />} />
          <Route path="/results/:pollId" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/my-polls" element={<MyPollsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
