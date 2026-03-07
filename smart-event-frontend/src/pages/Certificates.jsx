import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Mail, Send, UserCheck } from "lucide-react";
import { apiService } from "../apiService";
import { useToast } from "../context/ToastContext";
import "./certificates.css";

export default function Certificates() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eligible, setEligible] = useState([]);
  const [summary, setSummary] = useState({ eligibleCount: 0, withEmail: 0, withoutEmail: 0 });
  const [testEmail, setTestEmail] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const selectedEvent = useMemo(
    () => events.find((item) => String(item.event_id) === String(selectedEventId)) || null,
    [events, selectedEventId]
  );

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const data = await apiService.getCertificateEvents();
        const list = Array.isArray(data?.events) ? data.events : [];
        setEvents(list);
        if (list.length) {
          const firstWithAttendance = list.find((item) => Number(item.attended_count || 0) > 0);
          setSelectedEventId((firstWithAttendance || list[0]).event_id);
        }
      } catch (error) {
        showToast("Could not load certificate events", "error");
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [showToast]);

  useEffect(() => {
    if (!selectedEventId) return;

    const loadEligible = async () => {
      setLoadingEligible(true);
      try {
        const data = await apiService.getCertificateEligibleStudents(selectedEventId);
        setEligible(Array.isArray(data?.recipients) ? data.recipients : []);
        setSummary(data?.summary || { eligibleCount: 0, withEmail: 0, withoutEmail: 0 });
      } catch (error) {
        setEligible([]);
        setSummary({ eligibleCount: 0, withEmail: 0, withoutEmail: 0 });
        showToast("Could not load eligible students", "error");
      } finally {
        setLoadingEligible(false);
      }
    };

    loadEligible();
  }, [selectedEventId, showToast]);

  const handleGenerate = async () => {
    if (!selectedEventId) {
      showToast("Select an event first", "error");
      return;
    }

    setSending(true);
    try {
      const payload = testEmail.trim() ? { test_email: testEmail.trim() } : {};
      const data = await apiService.generateAndSendCertificates(selectedEventId, payload);
      setLastRun(data);
      showToast(`Certificates processed. Sent: ${data?.summary?.sentCount || 0}`, "success");

      const [eventsData, eligibleData] = await Promise.all([
        apiService.getCertificateEvents(),
        apiService.getCertificateEligibleStudents(selectedEventId),
      ]);

      setEvents(Array.isArray(eventsData?.events) ? eventsData.events : []);
      setEligible(Array.isArray(eligibleData?.recipients) ? eligibleData.recipients : []);
      setSummary(eligibleData?.summary || { eligibleCount: 0, withEmail: 0, withoutEmail: 0 });
    } catch (error) {
      showToast(error?.message || "Failed to generate certificates", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="certificates-page">
      <motion.div
        className="certificates-hero"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="certificates-icon-wrap"><Award size={34} /></div>
        <h1>Certificate Generation</h1>
        <p>Automatically issue and email participation certificates to attended students.</p>
      </motion.div>

      <section className="certificates-controls">
        <label htmlFor="cert-event">Event</label>
        <select
          id="cert-event"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          disabled={loadingEvents || !events.length}
        >
          {events.map((item) => (
            <option key={item.event_id} value={item.event_id}>
              {item.event_name} ({item.event_id})
            </option>
          ))}
        </select>

        <label htmlFor="cert-test-email">Test Email (optional override)</label>
        <input
          id="cert-test-email"
          type="email"
          placeholder="Leave empty to send to each student email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />

        <button type="button" onClick={handleGenerate} disabled={sending || loadingEligible || !selectedEventId}>
          <Send size={16} />
          {sending ? "Generating..." : "Generate & Send Certificates"}
        </button>
      </section>

      <section className="certificates-metrics">
        <div className="metric-card">
          <UserCheck size={18} />
          <div>
            <h3>{loadingEligible ? "..." : summary.eligibleCount}</h3>
            <p>Eligible Attendees</p>
          </div>
        </div>
        <div className="metric-card">
          <Mail size={18} />
          <div>
            <h3>{loadingEligible ? "..." : summary.withEmail}</h3>
            <p>With Email</p>
          </div>
        </div>
        <div className="metric-card warning">
          <Mail size={18} />
          <div>
            <h3>{loadingEligible ? "..." : summary.withoutEmail}</h3>
            <p>Missing Email</p>
          </div>
        </div>
      </section>

      <section className="certificates-grid">
        <article className="panel">
          <h2>Eligible Participants</h2>
          {loadingEligible ? <p>Loading attendees...</p> : null}
          {!loadingEligible && !eligible.length ? <p>No checked-in participants for this event.</p> : null}

          {!loadingEligible && eligible.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {eligible.map((row) => (
                    <tr key={`${row.user_id}-${row.attended_at || "x"}`}>
                      <td>{row.user_id}</td>
                      <td>{row.student_name || row.user_id}</td>
                      <td>{row.email || "-"}</td>
                      <td>{row.attended_at ? new Date(row.attended_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>

        <article className="panel">
          <h2>Last Dispatch</h2>
          {selectedEvent ? (
            <p className="muted">Selected: {selectedEvent.event_name} ({selectedEvent.event_id})</p>
          ) : null}

          {!lastRun ? <p>No dispatch yet.</p> : null}

          {lastRun ? (
            <>
              <div className="dispatch-summary">
                <p>Total: {lastRun.summary?.totalEligible || 0}</p>
                <p>Sent: {lastRun.summary?.sentCount || 0}</p>
                <p>Failed: {lastRun.summary?.failedCount || 0}</p>
                <p>Skipped: {lastRun.summary?.skippedCount || 0}</p>
              </div>

              <div className="dispatch-list">
                {(lastRun.results || []).map((item) => (
                  <div className={`dispatch-item ${item.status}`} key={`${item.user_id}-${item.status}`}>
                    <strong>{item.student_name || item.user_id}</strong>
                    <span>{item.email || "no-email"}</span>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </article>
      </section>
    </div>
  );
}
