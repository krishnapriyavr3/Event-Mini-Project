import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import Attendance from "./pages/Attendance";
import Venue from "./pages/Venue";
import Resources from "./pages/Resources";
import Volunteers from "./pages/Volunteers";
import Feedback from "./pages/Feedback";
import Participants from "./pages/Participants";

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

  return (
    <>
      <div className="theme-toggle" onClick={() => setDark(!dark)}>
        {dark ? "☀️" : "🌙"}
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/participants" element={<Participants />} />
      </Routes>
    </>
  );
}
