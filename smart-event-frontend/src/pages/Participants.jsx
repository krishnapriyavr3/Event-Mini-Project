import { useEffect, useState, useContext } from "react";
import { Send, Users, Search } from "lucide-react";
import { EventContext } from "../context/EventContext";
import { apiService } from "../apiService";
import "./participants.css";

export default function Participants() {
  const { event } = useContext(EventContext);
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [testEmail, setTestEmail] = useState("krishnapriyavr3@gmail.com");
  const [inviteStatus, setInviteStatus] = useState("");

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const [data, eventData] = await Promise.all([
          apiService.getParticipants(),
          apiService.getDiscoverEvents({ mode: "all", limit: 50 }),
        ]);
        setParticipants(data);

        const eventList = Array.isArray(eventData?.events) ? eventData.events : [];
        setEvents(eventList);

        if (event?.event_id) {
          setSelectedEventId(event.event_id);
        } else if (eventList.length) {
          setSelectedEventId(eventList[0].event_id);
        }
      } catch (err) {
        console.error("Error loading participants:", err);
      }
    };
    loadParticipants();
  }, [event]);

  const handleInvite = async (studentId) => {
    setInviteStatus("");

    if (!selectedEventId) {
      setInviteStatus("Select an active event before sending invites.");
      return;
    }

    try {
      const result = await apiService.inviteParticipant({
        student_id: studentId,
        event_id: selectedEventId,
        test_email: testEmail,
      });

      if (result.success) {
        setInviteStatus(`Email sent to ${testEmail} for student ${studentId}.`);
      }
    } catch (err) {
      setInviteStatus("Failed to send invitation email. Configure SMTP in backend .env.");
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="participants-page">
      <div className="participants-container">
        <div className="participants-header">
          <div className="header-title">
            <Users size={32} className="icon-blue" />
            <h1>Student Directory</h1>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or department..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="invite-config-row">
          <label htmlFor="invite-event-id">Invite For Event</label>
          <select
            id="invite-event-id"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((item) => (
              <option key={item.event_id} value={item.event_id}>
                {item.event_name} ({item.event_id})
              </option>
            ))}
          </select>

          <label htmlFor="invite-test-email">Invite Test Email</label>
          <input
            id="invite-test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to verify invite delivery"
          />
          {inviteStatus ? <span className="invite-status-msg">{inviteStatus}</span> : null}
        </div>

        <div className="table-card">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => (
                <tr key={p.user_id}>
                  <td className="id-cell">{p.user_id}</td>
                  <td className="name-cell">{p.name}</td>
                  <td className="dept-cell">
                    <span className="dept-tag">{p.department}</span>
                  </td>
                  <td>
                    <button onClick={() => handleInvite(p.user_id)} className="invite-action-btn">
                      <Send size={14} /> <span>Invite</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}