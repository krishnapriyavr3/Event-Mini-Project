import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, BarChart3, TrendingUp, Star, ThumbsUp, MessageCircle, Send, CheckCircle } from "lucide-react";
import { apiService } from "../apiService";
import { EventContext } from "../context/EventContext";
import "./feedback.css";

export default function Feedback() {
  const { event } = useContext(EventContext);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
  
  if (!rating || !event?.event_id) {
    return alert("Please select a rating and ensure an event is active.");
  }
  
  try {
    await apiService.submitFeedback({
      event_id: event.event_id,
      student_id: "STU001", // This must exist in the users table
      rating: rating,
      comments: comments
    });
    setSubmitted(true);
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Submission failed. Ensure the user STU001 exists in the database.");
  }
};

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
        {/* HEADER SECTION */}
        <motion.div className="feedback-header-compact" variants={itemVariants} custom={0}>
          <motion.div className="header-icon-small" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <MessageSquare size={32} />
          </motion.div>
          <h1>Feedback & Insights</h1>
          <p>Analyzing: <strong>{event?.name || "Global Data"}</strong></p>
        </motion.div>

        <div className="feedback-main-grid-compact">
          {/* LEFT: SUBMISSION FORM */}
          <motion.div className="form-column" variants={itemVariants} custom={1}>
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form key="form" onSubmit={handleFeedbackSubmit} className="feedback-form-styled" exit={{ opacity: 0, scale: 0.9 }}>
                  <h3>Share Your Experience</h3>
                  
                  {/* Rating Stars - Updated with CSS classes for theme visibility */}
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
                    required
                  />

                  <button type="submit" className="submit-action-btn">
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
                <BarChart3 size={18} /> <span>92% Positive Sentiment</span>
              </div>
              <div className="gauge-bg">
                <motion.div 
                  className="gauge-fill" 
                  initial={{ width: 0 }} 
                  animate={{ width: "92%" }} 
                  transition={{ duration: 1.5 }} 
                />
              </div>
            </motion.div>

            <motion.div className="rating-card-mini" variants={itemVariants} custom={3}>
              <Star size={18} className="active" fill="currentColor" />
              <div className="rating-info">
                <h3>4.7 / 5.0</h3>
                <p>Average from 234 responses</p>
              </div>
            </motion.div>

            <motion.div className="insights-card-mini" variants={itemVariants} custom={4}>
              <h3>AI Key Insights</h3>
              <div className="insight-row"><ThumbsUp size={14}/> <p>Great Organization</p></div>
              <div className="insight-row"><MessageCircle size={14}/> <p>Networking Sessions</p></div>
              <div className="insight-row"><TrendingUp size={14}/> <p>Growth Trend: +12%</p></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}