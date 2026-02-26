const API_URL = "http://localhost:5000/api";

export const apiService = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  getModelHealth: async () => {
    const res = await fetch(`${API_URL}/model-health`);
    if (!res.ok) throw new Error("Failed to fetch model health");
    return res.json();
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error("Failed to create event");
    return res.json();
  },

  getParticipants: async () => {
    const res = await fetch(`${API_URL}/participants`);
    if (!res.ok) throw new Error("Failed to fetch participants");
    return res.json();
  },

  getVolunteers: async () => {
    const res = await fetch(`${API_URL}/volunteers`);
    if (!res.ok) throw new Error("Failed to fetch volunteers");
    return res.json();
  },

  getResources: async () => {
    const res = await fetch(`${API_URL}/resources`);
    if (!res.ok) throw new Error("Failed to fetch resources");
    return res.json();
  },

  requestResource: async (id) => {
    const res = await fetch(`${API_URL}/resources/request/${id}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },

  predictEventInsights: async (eventData) => {
    const res = await fetch(`${API_URL}/ai/predict-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error("Prediction failed");
    return res.json();
  },

  getAttendancePrediction: async (eventName) => {
    return apiService.predictEventInsights({ name: eventName });
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

  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
  },

  getFeedbackTrends: async (eventId) => {
    const res = await fetch(`${API_URL}/feedback/trends/${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch feedback trends");
    return res.json();
  },
};