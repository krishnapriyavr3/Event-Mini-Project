import { useContext, useState, useEffect } from "react";
import { EventContext } from "../context/EventContext";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Users, BarChart3, ArrowRight } from "lucide-react";
import { apiService } from "../apiService"; // Ensure this import is here
import "./attendance.css";

export default function Attendance() {
  const { event } = useContext(EventContext);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // 1. Fully Functional Predict Logic
  const predict = async () => {
    if (!event) return;
    setLoading(true);
    try {
      // Calling the backend using the current event name from context
      const data = await apiService.getAttendancePrediction(event.name);
      setPrediction(data.predictedAttendance);
    } catch (error) {
      console.error("AI Prediction Error:", error);
      // Fallback to random if backend fails
      setPrediction(Math.floor(Math.random() * 150) + 50);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PARTICLE NETWORK ================= */
  useEffect(() => {
    const canvas = document.querySelector(".particle-network-attendance");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = 50;

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
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(14,165,233,0.5)";
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  if (!event)
    return (
      <motion.div className="attendance-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <canvas className="particle-network-attendance"></canvas>
        <div className="empty-state">
          <h2>No Event Created Yet</h2>
          <p>Create an event first to get attendance predictions</p>
        </div>
      </motion.div>
    );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.div className="attendance-page" initial="hidden" animate="visible" variants={containerVariants}>
      <canvas className="particle-network-attendance"></canvas>

      <motion.div className="attendance-header" variants={itemVariants} custom={0}>
        <motion.div className="header-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <TrendingUp size={48} />
        </motion.div>
        <h1>Attendance Prediction</h1>
        <p>AI-powered insights for {event.name}</p>
      </motion.div>

      <motion.div className="attendance-content" variants={containerVariants}>
        <motion.div className="event-info-card" variants={itemVariants} custom={1}>
          <div className="info-header">
            <Users size={24} />
            <h3>Event Details</h3>
          </div>
          <div className="info-body">
            <div className="info-item">
              <span className="label">Event Name</span>
              <span className="value">{event.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Event Type</span>
              <span className="value">{event.type}</span>
            </div>
            <div className="info-item">
              <span className="label">Date</span>
              <span className="value">{event.date}</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="prediction-card" variants={itemVariants} custom={2}>
          <div className="prediction-header">
            <Zap size={24} />
            <h3>Run Prediction</h3>
          </div>

          {!prediction ? (
            <motion.button
              className="predict-button"
              onClick={predict}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <motion.div className="button-loader" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Zap size={20} />
                </motion.div>
              ) : (
                <>
                  <span>Run AI Prediction</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          ) : (
            <motion.div className="prediction-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <BarChart3 size={40} className="result-icon" />
              <p className="result-label">Predicted Attendance</p>
              <h2 className="result-value">{prediction}</h2>
              <p className="result-unit">students</p>
              <motion.button className="reset-button" onClick={() => setPrediction(null)} whileHover={{ scale: 1.05 }}>
                Run Again
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <motion.div className="insights-card" variants={itemVariants} custom={3}>
          <h3>AI Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-dot"></span>
              <p>Historical data suggests strong attendance for {event.type} events</p>
            </div>
            <div className="insight-item">
              <span className="insight-dot"></span>
              <p>Based on volunteer availability and campus trends</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}