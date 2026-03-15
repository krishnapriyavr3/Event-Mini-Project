import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, PlayCircle, TerminalSquare } from "lucide-react";
import "./demo-checklist.css";

const steps = [
  "Run backend: npm run start:clean (or npm run seed:demo for demo data)",
  "Run frontend: npm run dev",
  "Open /create and fill in event details → this sets the active event",
  "Open /attendance and click Run AI Prediction",
  "Open /venue and verify the AI-recommended venue",
  "Open /student-auth, register a new student, then log in",
  "Open /student-events → browse events → open an event → click Give Feedback",
  "Submit a star rating and a comment → verify sentiment analysis result",
  "Open /volunteers and click Auto-Assign or assign manually",
  "Open /resources and submit a resource request",
  "Open /participants — search the directory and send an email invite",
  "Open /certificates, select the event, and generate a certificate",
];

export default function DemoChecklist() {
  return (
    <div className="demo-page">
      <div className="demo-card">
        <div className="demo-head">
          <PlayCircle size={30} />
          <h1>Demo Checklist</h1>
        </div>
        <p className="demo-sub">Use this flow during viva/demo for smooth end-to-end presentation.</p>

        <div className="demo-steps">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              className="demo-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CheckCircle2 size={16} />
              <span>{step}</span>
            </motion.div>
          ))}
        </div>

        <div className="demo-commands">
          <div className="cmd-title"><TerminalSquare size={16} /> Quick Commands</div>
          <p>cd backend && npm run start:clean</p>
          <p>cd smart-event-frontend && npm run dev</p>
          <p>cd backend && npm run seed:demo</p>
        </div>

        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  );
}
