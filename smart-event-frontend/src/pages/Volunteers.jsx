import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, ClipboardList, UserPlus, Heart, Shield, Trophy, Handshake } from "lucide-react";
import { apiService } from "../apiService";
import { EventContext } from "../context/EventContext";
import { useToast } from "../context/ToastContext";
import "./volunteers.css";

export default function Volunteers() {
  const { event } = useContext(EventContext);
  const { showToast } = useToast();
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedVol, setSelectedVol] = useState("");
  const [task, setTask] = useState("");
  const [autoAssigning, setAutoAssigning] = useState(false);

  const iconMap = {
    "Management": Users,
    "Stage Setup": Trophy,
    "Technical Support": Shield,
    "Photography": Zap,
    "Registration Desk": Handshake,
    "Coordination": Heart
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const volData = await apiService.getVolunteers();
        setVolunteers(volData);
        if (event?.event_id) {
          const assignData = await apiService.getAssignments(event.event_id);
          setAssignments(assignData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Unable to load volunteers right now.");
        showToast("Failed to load volunteer data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [event, showToast]);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedVol || !task || !event?.event_id) {
      showToast("Select volunteer, task, and active event", "error");
      return;
    }

    try {
      await apiService.assignVolunteer({
        volunteer_id: selectedVol,
        event_id: event.event_id,
        assigned_task: task
      });
      
      const updated = await apiService.getAssignments(event.event_id);
      setAssignments(updated);
      setTask("");
      setSelectedVol("");
      showToast("Volunteer assigned successfully", "success");
    } catch (err) {
      console.error("Assignment error:", err);
      showToast("Assignment failed. Please try again.", "error");
    }
  };

  const handleAutoAssign = async () => {
    if (!event?.event_id) {
      showToast("Select an active event before auto-assign", "error");
      return;
    }

    setAutoAssigning(true);
    try {
      const result = await apiService.autoAssignVolunteers(event.event_id);
      const updated = await apiService.getAssignments(event.event_id);
      setAssignments(updated);

      if (Number(result.createdCount || 0) > 0) {
        showToast(`Auto-assigned ${result.createdCount} volunteers`, "success");
      } else {
        showToast("No new volunteer assignments were created", "error");
      }
    } catch (err) {
      console.error("Auto assignment error:", err);
      showToast("Auto assignment failed. Please try again.", "error");
    } finally {
      setAutoAssigning(false);
    }
  };

  /* ================= PARTICLE NETWORK ================= */
  useEffect(() => {
    const canvas = document.querySelector(".particle-network-volunteers");
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
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
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

  return (
    <motion.div className="volunteers-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <canvas className="particle-network-volunteers"></canvas>

      <motion.div className="volunteers-header" initial={{ y: -20 }} animate={{ y: 0 }}>
        <div className="header-icon-container">
          <Users size={48} className="main-icon" />
        </div>
        <h1>Volunteer Management</h1>
        <p className="active-event-tag">Active Event: <span>{event?.name || "Global Database"}</span></p>
      </motion.div>

      <div className="volunteers-content">
        <div className="skills-section">
          <h3>Active Skill Categories</h3>
          {loading && <p className="inline-status">Loading volunteers...</p>}
          {error && <p className="inline-status error">{error}</p>}
          <div className="skills-grid">
            {[...new Set(volunteers.map(v => v.skills))].map((skill, idx) => {
              const Icon = iconMap[skill] || Zap;
              return (
                <motion.div key={idx} className="skill-badge-card" whileHover={{ scale: 1.05, y: -5 }}>
                  <Icon size={24} />
                  <span>{skill}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div className="assignment-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="section-header">
            <UserPlus size={24} color="#0ea5e9" />
            <h3>Assign New Task</h3>
          </div>
          <div className="auto-assign-row">
            <button
              type="button"
              className="auto-assign-btn"
              onClick={handleAutoAssign}
              disabled={autoAssigning || !event?.event_id}
            >
              {autoAssigning ? "Auto assigning..." : "Auto Assign by Event Type"}
            </button>
          </div>
          <form onSubmit={handleAssign} className="assignment-form">
            <div className="input-group">
              <label>Select Volunteer</label>
              <select value={selectedVol} onChange={(e) => setSelectedVol(e.target.value)} required>
                <option value="">-- Choose from Database --</option>
                {volunteers.map(v => (
                  <option key={v.volunteer_id} value={v.volunteer_id}>
                    {v.name} ({v.volunteer_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Task Description</label>
              <input 
                type="text" 
                placeholder="e.g. Stage Management" 
                value={task} 
                onChange={(e) => setTask(e.target.value)} 
                required
              />
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Confirm Assignment
            </motion.button>
          </form>
        </motion.div>

        <div className="assignments-section">
          <div className="section-header">
            <ClipboardList size={24} color="#0ea5e9" />
            <h3>Event Task List</h3>
          </div>
          <div className="table-wrapper">
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Task Assigned</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {assignments.length > 0 ? (
                    assignments.map((val, idx) => (
                      <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td className="vol-name">{val.name}</td>
                        <td className="vol-task">
                          <span className="task-pill">{val.assigned_task}</span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="no-data">No tasks assigned to {event?.name || "this event"} yet.</td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}