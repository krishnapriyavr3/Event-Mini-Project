const rawApiUrl = (import.meta.env.VITE_API_URL || "/api").trim();
const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

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

  getHealth: async () => {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error("Backend health check failed");
    return res.json();
  },

  getModelMetrics: async () => {
    const res = await fetch(`${API_URL}/ai/model-metrics`);
    if (!res.ok) throw new Error("Failed to fetch model metrics");
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

  requestResource: async (id, payload) => {
    const res = await fetch(`${API_URL}/resources/request/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) {
      let message = "Request failed";
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch (e) {
        // Keep fallback message when response is not JSON.
      }
      throw new Error(message);
    }
    return res.json();
  },

  getResourceAllocations: async (eventId) => {
    const query = new URLSearchParams({ event_id: String(eventId || "") });
    const res = await fetch(`${API_URL}/resources/allocations?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch resource allocations");
    return res.json();
  },

  returnResource: async (id, payload) => {
    const res = await fetch(`${API_URL}/resources/return/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });

    if (!res.ok) {
      let message = "Return failed";
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch (e) {
        // Keep fallback message when response is not JSON.
      }
      throw new Error(message);
    }

    return res.json();
  },

  createStudentSession: async (userId) => {
    const res = await fetch(`${API_URL}/students/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Could not login student");
    return res.json();
  },

  registerStudent: async (payload) => {
    const res = await fetch(`${API_URL}/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });

    if (!res.ok) {
      let message = 'Could not register student';
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch (e) {
        // Keep fallback when non-JSON error response is returned.
      }
      throw new Error(message);
    }

    return res.json();
  },

  getStudentProfile: async (studentId) => {
    const res = await fetch(`${API_URL}/students/${encodeURIComponent(studentId)}/profile`);
    if (!res.ok) throw new Error("Could not load student profile");
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

  autoAssignVolunteers: async (eventId) => {
    const res = await fetch(`${API_URL}/volunteers/auto-assign/${encodeURIComponent(eventId)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error("Failed to auto-assign volunteers");
    return res.json();
  },

  inviteParticipant: async (payload) => {
    const res = await fetch(`${API_URL}/participants/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to send invitation");
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

  getDiscoverEvents: async ({ mode = "all", limit = 20 } = {}) => {
    const query = new URLSearchParams({ mode, limit: String(limit) });
    const res = await fetch(`${API_URL}/events/discover?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch discover events");
    return res.json();
  },

  getRecommendedEvents: async ({ department = "", interest = "", userId = "", limit = 6 } = {}) => {
    const query = new URLSearchParams({
      department,
      interest,
      user_id: userId,
      limit: String(limit),
    });
    const res = await fetch(`${API_URL}/events/recommended?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch recommended events");
    return res.json();
  },

  getEventDetails: async (eventId) => {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/details`);
    if (!res.ok) throw new Error("Failed to fetch event details");
    return res.json();
  },

  getEventDetailsForStudent: async (eventId, userId) => {
    const query = new URLSearchParams({ user_id: userId });
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/details?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch event details");
    return res.json();
  },

  registerForEvent: async (eventId, payload) => {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to register for event");
    return res.json();
  },

  getRegistrationStatus: async (eventId, userId) => {
    const query = new URLSearchParams({ user_id: userId });
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/registration-status?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch registration status");
    return res.json();
  },

  checkInForEvent: async (eventId, userId) => {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to check in");
    return res.json();
  },

  getStudentReminders: async (studentId) => {
    const res = await fetch(`${API_URL}/students/${encodeURIComponent(studentId)}/reminders`);
    if (!res.ok) throw new Error("Failed to fetch reminders");
    return res.json();
  },

  askEventQuestion: async (eventId, payload) => {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(eventId)}/qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to get event answer");
    return res.json();
  },

  getStudentGamification: async (studentId) => {
    const res = await fetch(`${API_URL}/students/${encodeURIComponent(studentId)}/gamification`);
    if (!res.ok) throw new Error("Failed to fetch gamification profile");
    return res.json();
  },

  getEventIcsUrl: (eventId) => `${API_URL}/events/${encodeURIComponent(eventId)}/calendar.ics`,

  getCertificateEvents: async () => {
    const res = await fetch(`${API_URL}/certificates/events`);
    if (!res.ok) throw new Error("Failed to fetch certificate events");
    return res.json();
  },

  getCertificateEligibleStudents: async (eventId) => {
    const res = await fetch(`${API_URL}/certificates/event/${encodeURIComponent(eventId)}/eligible`);
    if (!res.ok) throw new Error("Failed to fetch certificate eligibility");
    return res.json();
  },

  generateAndSendCertificates: async (eventId, payload = {}) => {
    const res = await fetch(`${API_URL}/certificates/generate-send/${encodeURIComponent(eventId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = "Failed to generate certificates";
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch (e) {
        // Ignore parse errors and keep fallback message.
      }
      throw new Error(message);
    }

    return res.json();
  },
};