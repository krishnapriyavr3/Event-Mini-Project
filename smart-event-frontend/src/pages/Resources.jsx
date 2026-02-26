import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Headphones, Monitor, Cable, Lightbulb, Wifi } from "lucide-react";
import { apiService } from "../apiService";
import { useToast } from "../context/ToastContext";
import "./resources.css";

export default function Resources() {
  const { showToast } = useToast();
  const [dbResources, setDbResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const iconMap = {
    "Projectors": Monitor,
    "Microphones": Headphones,
    "Audio System": Cable,
    "Lighting Kits": Lightbulb,
    "WiFi Routers": Wifi,
    "Cables & Adapters": Package
  };

  const loadResources = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getResources();
      setDbResources(data || []);
    } catch (error) {
      console.error("Error loading resources:", error);
      setError("Could not load resources right now.");
      showToast("Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleRequest = async (resourceId) => {
    try {
      await apiService.requestResource(resourceId);
      await loadResources();
      showToast("Resource requested successfully", "success");
    } catch (error) {
      showToast("Request failed. Please try again.", "error");
    }
  };

  /* ================= PARTICLE NETWORK ================= */
  useEffect(() => {
    const canvas = document.querySelector(".particle-network-resources");
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
      ctx.fillStyle = "rgba(14,165,233,0.3)";
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return (
    <div className="resources-page">
      <canvas className="particle-network-resources"></canvas>

      <motion.div 
        className="resources-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-icon"><Package size={40} /></div>
        <h1>Available Resources</h1>
        <p>Live inventory from the campus equipment center</p>
      </motion.div>

      <div className="resources-grid">
        {loading ? (
          <div className="no-resources">Loading resources...</div>
        ) : error ? (
          <div className="no-resources">{error}</div>
        ) : dbResources.length > 0 ? (
          dbResources.map((resource, index) => {
            const Icon = iconMap[resource.name] || Package;
            return (
              <motion.div
                key={resource.resource_id}
                className="resource-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="resource-icon"><Icon size={32} /></div>
                <h3>{resource.name}</h3>
                <div className="resource-count">
                  {resource.available_count} / {resource.total_count}
                </div>
                <button
                  className="resource-button"
                  onClick={() => handleRequest(resource.resource_id)}
                  disabled={resource.available_count === 0}
                >
                  {resource.available_count > 0 ? "Request" : "Out of Stock"}
                </button>
              </motion.div>
            );
          })
        ) : (
          <div className="no-resources">No resources found in database.</div>
        )}
      </div>
    </div>
  );
}