import { useEffect, useState, useContext } from "react";
import { Send, Users, Search } from "lucide-react";
import { EventContext } from "../context/EventContext";
import { apiService } from "../apiService";
import "./participants.css";

export default function Participants() {
  const { event } = useContext(EventContext);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const data = await apiService.getParticipants();
        setParticipants(data);
      } catch (err) {
        console.error("Error loading participants:", err);
      }
    };
    loadParticipants();
  }, []);

  const handleInvite = async (studentId) => {
    try {
      const response = await fetch('http://localhost:5000/api/participants/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, event_id: event?.event_id })
      });
      const result = await response.json();
      if (result.success) alert(`Invitation sent to ${studentId}!`);
    } catch (err) {
      alert("Failed to send invitation.");
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