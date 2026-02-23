const API_URL = "http://localhost:5000/api";

export const apiService = {
  // 1. Fetch dashboard stats for Home.jsx
  getStats: async () => {
    const res = await fetch(`${API_URL}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  // 2. Save new event from CreateEvent.jsx
  createEvent: async (eventData) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error("Failed to create event");
    return res.json();
  },

  // 3. Fetch participants for Participants.jsx
  getParticipants: async () => {
    const res = await fetch(`${API_URL}/participants`);
    if (!res.ok) throw new Error("Failed to fetch participants");
    return res.json();
  },

  // 4. Fetch volunteers for Volunteers.jsx
  getVolunteers: async () => {
    const res = await fetch(`${API_URL}/volunteers`);
    if (!res.ok) throw new Error("Failed to fetch volunteers");
    return res.json();
  },

  // 5. Fetch resources for Resources.jsx
  getResources: async () => {
    const res = await fetch(`${API_URL}/resources`);
    if (!res.ok) throw new Error("Failed to fetch resources");
    return res.json();
  },
  // Request a resource
  requestResource: async (id) => {
    const res = await fetch(`${API_URL}/resources/request/${id}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },

  // 6. Fetch prediction for Attendance.jsx
  getAttendancePrediction: async (eventName) => {
    const res = await fetch(`${API_URL}/attendance-prediction/${encodeURIComponent(eventName)}`);
    if (!res.ok) throw new Error("Prediction failed");
    return res.json();
  },
  // frontend/src/apiService.js
requestResource: async (id) => {
  const res = await fetch(`${API_URL}/resources/request/${id}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error("Could not complete request");
  return res.json();
},
// Fetch specific assignments for an event
  getAssignments: async (eventId) => {
    const res = await fetch(`${API_URL}/volunteers/assignments/${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
  },
  getAssignments: async (eventId) => {
    const res = await fetch(`${API_URL}/volunteers/assignments/${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
  },
  assignVolunteer: async (assignmentData) => {
    const res = await fetch(`${API_URL}/volunteers/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    if (!res.ok) throw new Error("Failed to assign volunteer");
    return res.json();
  },
  assignVolunteer: async (assignmentData) => {
    const res = await fetch(`${API_URL}/volunteers/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData),
    });
    if (!res.ok) throw new Error("Failed to assign volunteer");
    return res.json();
  },
  // src/apiService.js

submitFeedback: async (feedbackData) => {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbackData),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
},
};