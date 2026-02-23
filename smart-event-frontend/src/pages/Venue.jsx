import { useContext, useEffect } from "react";
import { EventContext } from "../context/EventContext";
import { motion } from "framer-motion";
import { MapPin, Building2, Users, MapIcon, AlertCircle } from "lucide-react";
import "./venue.css";

export default function Venue() {
  const { event } = useContext(EventContext);

  /* ================= PARTICLE NETWORK ================= */
  useEffect(() => {
    const canvas = document.querySelector(".particle-network-venue");
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
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(14,165,233,0.5)";
      ctx.strokeStyle = "rgba(14,165,233,0.25)";
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  // 1. Show empty state if no event exists
  if (!event)
    return (
      <motion.div className="venue-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <canvas className="particle-network-venue"></canvas>
        <div className="empty-state">
          <h2>No Event Created Yet</h2>
          <p>Create an event first to get venue recommendations</p>
        </div>
      </motion.div>
    );

  // 2. SAFE RECOMMENDATION LOGIC
  const eventType = event?.type?.toLowerCase() || "";

  const venueName =
    eventType.includes("conference") || eventType.includes("tech")
      ? "Main Auditorium"
      : eventType.includes("cultural")
      ? "Grand Hall"
      : "Seminar Hall B";

  const capacity =
    venueName === "Main Auditorium" ? 500 : venueName === "Grand Hall" ? 300 : 150;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <motion.div className="venue-page" initial="hidden" animate="visible" variants={containerVariants}>
      <canvas className="particle-network-venue"></canvas>

      <motion.div className="venue-header" variants={itemVariants} custom={0}>
        <motion.div className="header-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <MapPin size={48} />
        </motion.div>
        <h1>Recommended Venue</h1>
        <p>Perfect location for your {event.type || "Event"}</p>
      </motion.div>

      <div className="venue-content">
        <motion.div className="venue-card" variants={itemVariants} custom={1}>
          <div className="venue-header-info">
            <Building2 size={32} />
            <h2>{venueName}</h2>
          </div>
          <div className="venue-details">
            <div className="detail-item">
              <Users size={20} />
              <div>
                <span className="label">Capacity</span>
                <span className="value">{capacity} people</span>
              </div>
            </div>
            <div className="detail-item">
              <MapIcon size={20} />
              <div>
                <span className="label">Location</span>
                <span className="value">Campus Main Campus</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ... (Amenity Card and Recommendation Card remain the same) */}
      </div>
    </motion.div>
  );
}