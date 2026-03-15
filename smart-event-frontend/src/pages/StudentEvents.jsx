import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Search, Sparkles, UserCircle } from "lucide-react";
import { apiService } from "../apiService";
import { useStudentSession } from "../context/StudentSessionContext";
import "./student-events.css";

const MODES = ["all", "current", "upcoming"];
const DEPARTMENTS = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "MBA"];

export default function StudentEvents() {
  const { session, logout } = useStudentSession();
  const [mode, setMode] = useState("all");
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [interest, setInterest] = useState("technical");
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [error, setError] = useState("");

  const studentId = session?.user_id || "";

  useEffect(() => {
    if (!studentId) {
      setEvents([]);
      setLoading(false);
      setError("");
      return;
    }

    const loadEvents = async () => {
      setLoading(true);
      setError("");

      const fetchAttempt = async () => apiService.getDiscoverEvents({ mode, limit: 30 });

      try {
        let data;
        try {
          data = await fetchAttempt();
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 900));
          data = await fetchAttempt();
        }

        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setEvents([]);
        try {
          await apiService.getHealth();
          setError("Events API is temporarily unavailable. Please retry in a few seconds.");
        } catch {
          setError("Backend looks offline. Start backend server and retry.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [mode, studentId]);

  useEffect(() => {
    if (!studentId) {
      setRecommended([]);
      setLoadingRecommended(false);
      return;
    }

    const loadRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const data = await apiService.getRecommendedEvents({
          department,
          interest,
          userId: studentId,
          limit: 6,
        });
        setRecommended(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setRecommended([]);
      } finally {
        setLoadingRecommended(false);
      }
    };

    loadRecommended();
  }, [department, interest, studentId]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return events;

    return events.filter((event) => {
      return [event.event_name, event.type, event.location, event.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [events, query]);

  return (
    <motion.div className="student-events-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="student-events-shell">
        {!session ? (
          <section className="student-login-card">
            <h2>Student Explorer</h2>
            <p>Login or register first, then continue to explorer.</p>
            <p>
              Please <Link to="/student-auth">Login or Register</Link> to continue.
            </p>
          </section>
        ) : (
          <div className="session-banner">
            <div className="session-user">
              <UserCircle size={18} />
              <p>Logged in as <strong>{session.name || session.user_id}</strong> · {session.department || "Student"}</p>
            </div>
            <button type="button" onClick={logout}>Logout</button>
          </div>
        )}

        <header className="student-events-header">
          <div>
            <h1>Student Event Explorer</h1>
            <p>Check live and upcoming campus events, then plan where to join.</p>
          </div>
          <div className="student-events-search-wrap">
            <div className="student-events-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by event name, type or location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="reco-controls">
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Interest: AI, robotics, music"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="student-events-mode-switch">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              className={item === mode ? "active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? <p className="state-msg">Loading events...</p> : null}
        {error ? <p className="state-msg error">{error}</p> : null}

        {!loading && !error && (
          <section className="student-events-grid">
            {filtered.map((event) => (
              <Link key={event.event_id} className="event-tile" to={`/student-events/${event.event_id}`}>
                <div className="tile-top">
                  <span className={`badge ${String(event.timeline || "upcoming").toLowerCase()}`}>
                    {event.timeline || "Upcoming"}
                  </span>
                  <span className="event-type">{event.type || "General"}</span>
                </div>

                <h3>{event.event_name || "Untitled Event"}</h3>

                <p className="event-meta">
                  <CalendarDays size={14} />
                  <span>{event.date ? new Date(event.date).toLocaleDateString() : "Date TBA"}</span>
                </p>

                <p className="event-meta">
                  <Sparkles size={14} />
                  <span>{event.location || "Campus"}</span>
                </p>

                <p className="event-meta crowd-meta">
                  <span className={`crowd crowd-${String(event.crowdLevel || "Low").toLowerCase()}`}>
                    {event.crowdLevel || "Low"} Crowd
                  </span>
                  <span>AI attendance: {event.predictedAttendance || 0}</span>
                </p>

                <p className="event-desc">{event.description || "No description provided yet."}</p>
              </Link>
            ))}
          </section>
        )}

        <section className="recommended-block">
          <h2>Recommended for You</h2>
          {loadingRecommended ? <p className="state-msg">Loading recommendations...</p> : null}
          {!loadingRecommended && (
            <div className="student-events-grid recommended-grid">
              {recommended.map((event) => (
                <Link key={event.event_id} className="event-tile recommended" to={`/student-events/${event.event_id}`}>
                  <div className="tile-top">
                    <span className="badge upcoming">Suggested</span>
                    <span className="event-type">{event.type || "General"}</span>
                  </div>
                  <h3>{event.event_name || "Untitled Event"}</h3>
                  <p className="event-meta">
                    <CalendarDays size={14} />
                    <span>{event.date ? new Date(event.date).toLocaleDateString() : "Date TBA"}</span>
                  </p>
                  <p className="event-meta crowd-meta">
                    <span className={`crowd crowd-${String(event.crowdLevel || "Low").toLowerCase()}`}>
                      {event.crowdLevel || "Low"} Crowd
                    </span>
                    <span>{event.recommendedVenue?.venue_name || "Campus Venue"}</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
