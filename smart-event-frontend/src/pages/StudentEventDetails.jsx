import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Users, ArrowLeft, BellRing, Award, MessageCircle } from "lucide-react";
import { apiService } from "../apiService";
import { useStudentSession } from "../context/StudentSessionContext";
import "./student-event-details.css";

const toReadableDate = (value) => {
  if (!value) return "Date TBA";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Date TBA";
  return dt.toLocaleString();
};

const buildGoogleCalendarUrl = (event) => {
  const start = event?.date ? new Date(event.date) : new Date();
  const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = new Date(safeStart.getTime() + 2 * 60 * 60 * 1000);

  const toGCalDate = (value) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event?.event_name || "Campus Event",
    dates: `${toGCalDate(safeStart)}/${toGCalDate(end)}`,
    details: event?.description || "Smart Event Management",
    location: event?.location || "Campus",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildMapEmbedUrl = (event) => {
  const locationText = String(event?.location || "Adi Shankara Institute of Engineering and Technology, Kalady");
  return `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

const buildGoogleMapsUrl = (event) => {
  const locationText = String(event?.location || "Adi Shankara Institute of Engineering and Technology, Kalady");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
};

export default function StudentEventDetails() {
  const { eventId } = useParams();
  const { session, loading: sessionLoading, error: sessionError, login, logout } = useStudentSession();
  const [loginId, setLoginId] = useState("");

  const studentId = session?.user_id || "";

  const [data, setData] = useState({ event: null, relatedEvents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reminders, setReminders] = useState([]);
  const [gamification, setGamification] = useState({ profile: null, certificates: [] });

  const [actionMessage, setActionMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId.trim()) return;
    await login(loginId.trim());
    setLoginId("");
  };

  const loadAll = async () => {
    if (!studentId) {
      setLoading(false);
      setError("");
      setData({ event: null, relatedEvents: [] });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const fetchAttempt = async () => Promise.all([
        apiService.getEventDetailsForStudent(eventId, studentId),
        apiService.getStudentReminders(studentId),
        apiService.getStudentGamification(studentId),
      ]);

      let details;
      let reminderData;
      let gamificationData;

      try {
        [details, reminderData, gamificationData] = await fetchAttempt();
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 900));
        [details, reminderData, gamificationData] = await fetchAttempt();
      }

      setData({
        event: details.event || null,
        relatedEvents: Array.isArray(details.relatedEvents) ? details.relatedEvents : [],
      });
      setReminders(Array.isArray(reminderData.reminders) ? reminderData.reminders : []);
      setGamification({
        profile: gamificationData.profile || null,
        certificates: Array.isArray(gamificationData.certificates) ? gamificationData.certificates : [],
      });
    } catch (err) {
      try {
        await apiService.getHealth();
        setError("Unable to load event details right now. Please retry in a few seconds.");
      } catch {
        setError("Backend appears offline. Start backend server and retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, studentId]);

  const currentReminder = reminders.find((item) => item.event_id === eventId) || null;

  const handleRegister = async () => {
    if (!studentId.trim()) return;
    setActionMessage("");
    try {
      const result = await apiService.registerForEvent(eventId, {
        user_id: studentId,
        reminder_opt_in: true,
      });
      setActionMessage(result.message || "Registration updated");
      await loadAll();
    } catch (err) {
      setActionMessage("Could not complete registration.");
    }
  };

  const handleCheckIn = async () => {
    if (!studentId.trim()) return;
    setActionMessage("");
    try {
      const result = await apiService.checkInForEvent(eventId, studentId);
      setActionMessage(result.message || "Checked in");
      await loadAll();
    } catch (err) {
      setActionMessage("Could not check in.");
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    setQaAnswer("");
    if (!question.trim()) return;

    try {
      const result = await apiService.askEventQuestion(eventId, {
        question,
        user_id: studentId,
      });
      setQaAnswer(result.answer || "No answer available.");
    } catch (err) {
      setQaAnswer("Could not fetch answer right now.");
    }
  };

  if (!session) {
    return (
      <div className="student-detail-page">
        <div className="student-detail-shell">
          <section className="student-login-card">
            <h2>Student Sign In</h2>
            <p>Login with Student ID to view detailed event actions and your registration status.</p>
            <form className="student-login-form" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Enter Student ID (example: U001)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
              <button type="submit" disabled={sessionLoading}>Continue</button>
            </form>
            {sessionError ? <p className="small-meta">{sessionError}</p> : null}
          </section>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="student-detail-page"><p>Loading event details...</p></div>;
  }

  if (error || !data.event) {
    return <div className="student-detail-page"><p>{error || "Event not found."}</p></div>;
  }

  const { event } = data;
  const mapSrc = buildMapEmbedUrl(event);
  const seats = event.seats || { seatLimit: 0, registeredCount: 0, waitlistCount: 0, seatsLeft: 0, registrationClosed: false };
  const registrationStatus = event.myRegistration?.status || "not_registered";
  const feedback = event.feedbackSummary || { positive: 0, neutral: 0, negative: 0, total: 0, averageRating: 0 };

  return (
    <div className="student-detail-page">
      <div className="student-detail-shell">
        <div className="session-banner">
          <p>Logged in as <strong>{session.name || session.user_id}</strong> ({session.department || "Student"})</p>
          <button type="button" onClick={logout}>Logout</button>
        </div>

        <Link to="/student-events" className="back-link">
          <ArrowLeft size={16} /> Back to Explorer
        </Link>

        <section className="hero-banner">
          <div className="hero-overlay">
            <div className="hero-left">
              <h1>{event.event_name}</h1>
              <p className="hero-sub">{event.type || "General Event"}</p>
              <p>{event.description || "No description available."}</p>
            </div>
            <div className="hero-card">
              <h3>AI Snapshot</h3>
              <p><Users size={14} /> Expected crowd: {event.predictedAttendance || 0} ({event.crowdLevel || "Low"})</p>
              <p><MapPin size={14} /> Suggested venue: {event.recommendedVenue?.venue_name || "Campus Venue"}</p>
              <p><CalendarDays size={14} /> {toReadableDate(event.date)}</p>
              <div className="seat-stats">
                <span>Seats left: {seats.seatsLeft}</span>
                <span>Waitlist: {seats.waitlistCount}</span>
              </div>
              <div className="action-row">
                <button type="button" onClick={handleRegister}>One-click Register</button>
                <button type="button" onClick={handleCheckIn} className="secondary">Check In</button>
              </div>
              <div className="calendar-row">
                <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noreferrer">Add to Google Calendar</a>
                <a href={apiService.getEventIcsUrl(event.event_id)} target="_blank" rel="noreferrer">Download ICS</a>
              </div>
              <p className="small-meta">Status: {registrationStatus.replace("_", " ")}</p>
              {actionMessage ? <p className="small-meta">{actionMessage}</p> : null}
            </div>
          </div>
        </section>

        {currentReminder ? (
          <section className="inline-alert">
            <BellRing size={16} />
            <span>{currentReminder.message}</span>
          </section>
        ) : null}

        <section className="detail-grid">
          <article className="panel">
            <h3>Description</h3>
            <p>{event.description || "No description provided yet."}</p>
            <h4>Event Location</h4>
            <p>{event.location || "Campus Main"}</p>
            <h4>Tags</h4>
            <div className="tags-wrap">
              <span>{event.type || "General"}</span>
              <span>{event.crowdLevel || "Low Crowd"}</span>
              <span>{event.status || "Planned"}</span>
            </div>
          </article>

          <article className="panel">
            <h3>Event Location Map</h3>
            <iframe
              title="event-location-map"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-links">
              <a href={buildGoogleMapsUrl(event)} target="_blank" rel="noreferrer">Open in Google Maps</a>
            </div>
          </article>
        </section>

        <section className="detail-grid extra-grid">
          <article className="panel">
            <h3><MessageCircle size={16} /> Event Q&A Assistant</h3>
            <form className="qa-form" onSubmit={handleAsk}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask: Where is the venue? What to bring? Is registration closed?"
              />
              <button type="submit">Ask</button>
            </form>
            {qaAnswer ? <p className="qa-answer">{qaAnswer}</p> : null}
          </article>

          <article className="panel">
            <h3><Award size={16} /> Participation Streak & Certificates</h3>
            <p>Streak: {gamification.profile?.streak_count || 0} days</p>
            <p>Points: {gamification.profile?.points || 0}</p>
            <p>Total attended: {gamification.profile?.total_attended || 0}</p>
            <p>Certificates: {gamification.profile?.certificates_earned || 0}</p>
            <div className="cert-list">
              {gamification.certificates.map((item) => (
                <a key={item.certificate_id} href={item.certificate_url || "#"} target="_blank" rel="noreferrer">
                  {item.event_id} certificate
                </a>
              ))}
            </div>
          </article>
        </section>

        <section className="panel sentiment-panel">
          <h3>Overall Student Sentiment</h3>
          <div className="sentiment-grid">
            <div><strong>{feedback.positive}</strong><span>Positive</span></div>
            <div><strong>{feedback.neutral}</strong><span>Neutral</span></div>
            <div><strong>{feedback.negative}</strong><span>Negative</span></div>
            <div><strong>{feedback.averageRating}</strong><span>Avg Rating</span></div>
          </div>
        </section>

        <section className="related-block">
          <h3>Other events you may like</h3>
          <div className="related-grid">
            {data.relatedEvents.map((item) => (
              <Link key={item.event_id} to={`/student-events/${item.event_id}`} className="related-card">
                <p className="related-type">{item.type || "General"}</p>
                <h4>{item.event_name}</h4>
                <p>{item.date ? new Date(item.date).toLocaleDateString() : "Date TBA"}</p>
                <p>{item.crowdLevel || "Low"} Crowd</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
