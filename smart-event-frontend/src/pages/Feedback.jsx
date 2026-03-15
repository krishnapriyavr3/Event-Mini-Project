import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, BarChart3, TrendingUp, Star, ThumbsUp, MessageCircle, Send, CheckCircle } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiService } from "../apiService";
import { EventContext } from "../context/EventContext";
import { useStudentSession } from "../context/StudentSessionContext";
import { useToast } from "../context/ToastContext";
import "./feedback.css";

export default function Feedback() {
  const { eventId: routeEventId } = useParams();
  const location = useLocation();
  const { event } = useContext(EventContext);
  const { session } = useStudentSession();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sentimentResult, setSentimentResult] = useState(null);
  const [eventName, setEventName] = useState("");
  const [trendData, setTrendData] = useState({ positive: 0, neutral: 0, negative: 0, total: 0, averageRating: 0 });

  const selectedEventId = routeEventId || event?.event_id || "";
  const canSubmit = Boolean(session?.user_id && selectedEventId);
  const redirectTarget = `${location.pathname}${location.search || ""}`;

  /* ================= PARTICLE NETWORK ================= */
  useEffect(() => {
    const canvas = document.querySelector(".particle-network-feedback");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = 1.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() { 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill(); 
      }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(14,165,233,0.5)";
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user_id) {
      showToast("Please login as a student to submit feedback", "error");
      return;
    }

    if (!rating || !selectedEventId) {
      showToast("Please select a rating and event", "error");
      return;
    }

    try {
      const response = await apiService.submitFeedback({
        event_id: selectedEventId,
        student_id: session.user_id,
        rating,
        comments,
      });
      setSentimentResult(response.sentiment || null);
      setSubmitted(true);
      showToast("Feedback submitted successfully", "success");
      const latestTrend = await apiService.getFeedbackTrends(selectedEventId);
      setTrendData(latestTrend);
    } catch (err) {
      console.error("Submission failed:", err);
      showToast("Submission failed. Please try again.", "error");
    }
  };

  useEffect(() => {
    const loadEventName = async () => {
      if (!selectedEventId) {
        setEventName("");
        return;
      }

      if (event?.event_id && String(event.event_id) === String(selectedEventId)) {
        setEventName(event.name || event.event_name || "");
        return;
      }

      try {
        const details = await apiService.getEventDetails(selectedEventId);
        setEventName(details?.event?.event_name || "");
      } catch {
        setEventName("");
      }
    };

    loadEventName();
  }, [event, selectedEventId]);

  useEffect(() => {
    const loadTrendData = async () => {
      if (!selectedEventId) return;
      try {
        const data = await apiService.getFeedbackTrends(selectedEventId);
        setTrendData(data);
      } catch (error) {
        setTrendData({ positive: 0, neutral: 0, negative: 0, total: 0, averageRating: 0 });
      }
    };

    loadTrendData();
  }, [selectedEventId]);

  const sentimentScore = sentimentResult?.score ?? 0;
  const sentimentLabel = sentimentResult?.label || "Pending";
  const sentimentClass = sentimentLabel.toLowerCase();

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    }),
  };

  return (
    <motion.div className="feedback-page" initial="hidden" animate="visible">
      <canvas className="particle-network-feedback"></canvas>

      <div className="feedback-container-fixed">
        {!session ? (
          <div className="feedback-auth-banner">
            <p>Please login or register to submit event feedback.</p>
            <Link to={`/student-auth?redirect=${encodeURIComponent(redirectTarget)}`}>Go to Student Auth</Link>
          </div>
        ) : null}

        {!selectedEventId ? (
          <div className="feedback-auth-banner">
            <p>Select an event from Student Explorer to submit feedback.</p>
            <Link to="/student-events">Open Student Explorer</Link>
          </div>
        ) : null}

        {/* HEADER SECTION */}
        <motion.div className="feedback-header-compact" variants={itemVariants} custom={0}>
          <motion.div className="header-icon-small" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <MessageSquare size={32} />
          </motion.div>
          <h1>Feedback & Insights</h1>
          <p>Analyzing: <strong>{eventName || selectedEventId || "Global Data"}</strong></p>
        </motion.div>

        <div className="feedback-main-grid-compact">
          {/* LEFT: SUBMISSION FORM */}
          <motion.div className="form-column" variants={itemVariants} custom={1}>
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form key="form" onSubmit={handleFeedbackSubmit} className="feedback-form-styled" exit={{ opacity: 0, scale: 0.9 }}>
                  <h3>Share Your Experience</h3>
                  
                  {/* Rating Stars */}
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        className={`star-icon ${star <= (hover || rating) ? "active" : ""}`}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                        fill={star <= (hover || rating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>

                  <textarea 
                    placeholder="Add your comments here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    disabled={!canSubmit}
                    required
                  />

                  <button type="submit" className="submit-action-btn" disabled={!canSubmit}>
                    <Send size={18} /> Submit Feedback
                  </button>
                </motion.form>
              ) : (
                <motion.div className="success-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CheckCircle size={50} color="#0ea5e9" />
                  <h4>Feedback Received!</h4>
                  <p>Your insights help us improve future events.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: AI ANALYTICS & INSIGHTS (Placeholder Data) */}
          <motion.div className="analytics-column">
            <motion.div className="sentiment-card-mini" variants={itemVariants} custom={2}>
              <div className="card-label">
                <BarChart3 size={18} /> <span>{sentimentScore}% {sentimentLabel} Sentiment</span>
              </div>
              <div className="gauge-bg">
                <motion.div 
                  className="gauge-fill" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${sentimentScore}%` }} 
                  transition={{ duration: 1.5 }} 
                />
              </div>
              <div className={`sentiment-pill ${sentimentClass}`}>{sentimentLabel}</div>
            </motion.div>

            <motion.div className="rating-card-mini" variants={itemVariants} custom={3}>
              <Star size={18} className="active" fill="currentColor" />
              <div className="rating-info">
                <h3>{Number(trendData.averageRating || 0).toFixed(1)} / 5.0</h3>
                <p>Average from {trendData.total || 0} responses</p>
              </div>
            </motion.div>

            <motion.div className="insights-card-mini" variants={itemVariants} custom={4}>
              <h3>AI Key Insights</h3>
              <div className="insight-row"><ThumbsUp size={14}/> <p>Sentiment: {sentimentLabel}</p></div>
              <div className="insight-row"><MessageCircle size={14}/> <p>Positive cues: {sentimentResult?.positiveHits?.join(", ") || "N/A"}</p></div>
              <div className="insight-row"><TrendingUp size={14}/> <p>Negative cues: {sentimentResult?.negativeHits?.join(", ") || "N/A"}</p></div>
              <div className="trend-bars">
                <div className="trend-row"><span>Positive</span><div className="trend-track"><div className="trend-fill pos" style={{ width: `${trendData.total ? (trendData.positive / trendData.total) * 100 : 0}%` }} /></div></div>
                <div className="trend-row"><span>Neutral</span><div className="trend-track"><div className="trend-fill neu" style={{ width: `${trendData.total ? (trendData.neutral / trendData.total) * 100 : 0}%` }} /></div></div>
                <div className="trend-row"><span>Negative</span><div className="trend-track"><div className="trend-fill neg" style={{ width: `${trendData.total ? (trendData.negative / trendData.total) * 100 : 0}%` }} /></div></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}