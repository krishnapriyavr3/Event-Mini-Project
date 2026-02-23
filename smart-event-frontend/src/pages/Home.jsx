import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  MapPin,
  Package,
  Zap,
  MessageSquare,
  TrendingUp,
  Calendar,
  Flame,
  Target,
} from "lucide-react";
import "./home.css";

export default function Home() {

  /* ================= AI HERO TEXT ================= */

  const aiMessages = [
    "Predicting Attendance Using Historical Data...",
    "Optimizing Venue Allocation...",
    "Analyzing Feedback Sentiments...",
    "Allocating Volunteers by Skill Matrix..."
  ];

  const [aiText, setAiText] = useState(aiMessages[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % aiMessages.length;
      setAiText(aiMessages[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  /* ================= DASHBOARD COUNTER ================= */

  const [count, setCount] = useState({
    events: 0,
    active: 0,
    upcoming: 0,
    completed: 0,
  });

  useEffect(() => {
    let interval = setInterval(() => {
      setCount((prev) => ({
        events: prev.events < 24 ? prev.events + 1 : 24,
        active: prev.active < 5 ? prev.active + 1 : 5,
        upcoming: prev.upcoming < 8 ? prev.upcoming + 1 : 8,
        completed: prev.completed < 11 ? prev.completed + 1 : 11,
      }));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  /* ================= AI INSIGHT ROTATION ================= */

  const insights = [
    "Venue capacity may exceed limit.",
    "23 attendees pending confirmation.",
    "Budget optimization suggestion available.",
    "High engagement expected based on trend."
  ];

  const [insight, setInsight] = useState(insights[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % insights.length;
      setInsight(insights[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CARD 3D EFFECT ================= */

  useEffect(() => {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = (y / rect.height - 0.5) * 8;
        const rotateY = (x / rect.width - 0.5) * -8;

        card.style.transform =
          `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0deg) rotateY(0deg)";
      });
    });
  }, []);

  /* ================= MOUSE PARALLAX BACKGROUND ================= */

  useEffect(() => {
    const icons = document.querySelectorAll(".bg-icon");

    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 40;
      const y = (window.innerHeight / 2 - e.clientY) / 40;

      icons.forEach((icon, index) => {
        const depth = (index + 1) * 0.3;
        icon.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* ================= SCROLL DEPTH ================= */

  useEffect(() => {
    const icons = document.querySelectorAll(".bg-icon");

    const handleScroll = () => {
      const scrollY = window.scrollY;

      icons.forEach((icon, index) => {
        const depth = (index + 1) * 0.06;
        icon.style.marginTop = `${scrollY * depth}px`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= AI PARTICLE NETWORK ================= */

  useEffect(() => {
    const canvas = document.querySelector(".particle-network");
    const ctx = canvas.getContext("2d");

    let particles = [];
    const particleCount = 70;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = dx * dx + dy * dy;

          if (distance < 9000) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(14,165,233,0.6)";
      ctx.strokeStyle = "rgba(14,165,233,0.3)";

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div className="home">

      <canvas className="particle-network"></canvas>

      <div className="bg-icon icon1">📅</div>
      <div className="bg-icon icon2">🎤</div>
      <div className="bg-icon icon3">🎟️</div>
      <div className="bg-icon icon4">📊</div>
      <div className="bg-icon icon5">🤖</div>

      <section className="hero">
        <h1>AI Smart Event Management System</h1>
        <p className="ai-text">{aiText}</p>
      </section>

      <section className="dashboard">
        <motion.div className="dash-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <motion.div className="card-icon" animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 16px rgba(14,165,233,0.8))" }}>
            <Calendar size={32} />
          </motion.div>
          <h2>{count.events}</h2>
          <span>Total Events</span>
        </motion.div>

        <motion.div className="dash-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <motion.div className="card-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 16px rgba(14,165,233,0.8))" }}>
            <Flame size={32} />
          </motion.div>
          <h2>{count.active}</h2>
          <span>Live Now</span>
        </motion.div>

        <motion.div className="dash-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <motion.div className="card-icon" animate={{ y: [0, -4, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 16px rgba(14,165,233,0.8))" }}>
            <TrendingUp size={32} />
          </motion.div>
          <h2>{count.upcoming}</h2>
          <span>Upcoming</span>
        </motion.div>

        <motion.div className="dash-card" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <motion.div className="card-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 16px rgba(14,165,233,0.8))" }}>
            <Target size={32} />
          </motion.div>
          <h2>{count.completed}</h2>
          <span>Completed</span>
        </motion.div>
      </section>

      <section className="features">
        <Link to="/create" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <Plus size={40} />
          </motion.div>
          <h3>Create Event</h3>
          <p>Design and launch intelligent events.</p>
        </Link>

        <Link to="/attendance" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <TrendingUp size={40} />
          </motion.div>
          <h3>Attendance Prediction</h3>
          <p>AI-based turnout estimation.</p>
        </Link>

        <Link to="/venue" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <MapPin size={40} />
          </motion.div>
          <h3>Venue Selection</h3>
          <p>Capacity-aware smart allocation.</p>
        </Link>

        <Link to="/resources" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <Package size={40} />
          </motion.div>
          <h3>Resources</h3>
          <p>Equipment and asset management.</p>
        </Link>

        <Link to="/volunteers" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <Zap size={40} />
          </motion.div>
          <h3>Volunteers</h3>
          <p>Skill-based allocation system.</p>
        </Link>

        <Link to="/feedback" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 3.9, repeat: Infinity, ease: "easeInOut", delay: 1.0 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <MessageSquare size={40} />
          </motion.div>
          <h3>Feedback Analysis</h3>
          <p>Sentiment-driven insights.</p>
        </Link>

        <Link to="/participants" className="card">
          <motion.div className="feature-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} whileHover={{ scale: 1.2, filter: "drop-shadow(0 0 20px rgba(14,165,233,0.9))" }}>
            <Users size={40} />
          </motion.div>
          <h3>Past Participants</h3>
          <p>Track returning attendees.</p>
        </Link>
      </section>

      <section className="ai-insight">
        <h3>AI Insight</h3>
        <p>{insight}</p>
      </section>

    </div>
  );
}
