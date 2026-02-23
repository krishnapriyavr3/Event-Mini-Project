import { useState, useContext } from "react";
import { PlusCircle, Calendar, MapPin, AlignLeft, DollarSign } from "lucide-react";
import { apiService } from "../apiService";
import { EventContext } from "../context/EventContext";
import "./create-event.css";

export default function CreateEvent() {
  const { setEvent } = useContext(EventContext);
  const [formData, setFormData] = useState({
    name: "Dextra",
    type: "Workshop",
    date: "",        // Added date back to state
    location: "",
    description: "",
    budget: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Core validation to prevent the "Please fill in all fields" alert
    if (!formData.name || !formData.date || !formData.location) {
      alert("Please fill in all required fields (Name, Date, and Location)");
      return;
    }

    try {
      const response = await apiService.createEvent(formData);
      
      // Update context so other pages (Venue/Feedback) have access to the new event_id
      setEvent({ 
        event_id: response.event_id, 
        name: formData.name,
        type: formData.type,
        date: formData.date 
      });

      alert(`Event Created Successfully! ID: ${response.event_id}`);
    } catch (err) {
      alert("Submission failed. Check if the backend server is running.");
    }
  };

  return (
    <div className="create-event">
      <div className="create-form">
        <div className="form-header">
          <PlusCircle size={32} color="#0ea5e9" />
          <h2>Create Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Event Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Event Type</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Cultural">Cultural</option>
               <option value="Technical">Technical</option>
                <option value="Conference">Conference</option>
                 <option value="Networking">Networking</option>
            </select>
          </div>

          {/* THE MISSING DATE FIELD */}
          <div className="form-group">
            <label><Calendar size={16} /> Event Date</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({...formData, date: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label><MapPin size={16} /> Location</label>
            <input 
              type="text" 
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label><DollarSign size={16} /> Budget</label>
            <input 
              type="number" 
              value={formData.budget} 
              onChange={(e) => setFormData({...formData, budget: e.target.value})} 
            />
          </div>

          <div className="form-group full-width">
            <label><AlignLeft size={16} /> Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <button type="submit" className="create-button">Create Event →</button>
        </form>
      </div>
    </div>
  );
}