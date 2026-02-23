const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DASHBOARD & PARTICIPANTS ---
app.get('/api/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM events) as totalEvents,
        (SELECT COUNT(*) FROM events WHERE status = 'Planned') as upcoming,
        (SELECT COUNT(*) FROM users WHERE role = 'Student') as totalStudents
    `);
    res.json(stats[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/participants', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, name, department FROM users WHERE role = 'Student' LIMIT 20");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EVENTS ---
app.post('/api/events', async (req, res) => {
  const { name, type, date, location, description, budget } = req.body;
  const event_id = 'E' + Math.floor(100 + Math.random() * 900);
  try {
    const sql = `INSERT INTO events (event_id, event_name, type, date, location, description, budget, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'Planned')`;
    // Using fallbacks to ensure the query doesn't fail if optional fields are missing
    await db.query(sql, [
      event_id, 
      name, 
      type, 
      date, 
      location || 'Campus Main', 
      description || '', 
      budget || 0
    ]);
    res.status(201).json({ message: "Event Created", event_id });
  } catch (err) {
    console.error("EVENT CREATION ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- VOLUNTEERS & ASSIGNMENTS ---
app.get('/api/volunteers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/volunteers/assignments/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.query(`
      SELECT v.name, v.skills as role, va.assigned_task 
      FROM volunteers v 
      JOIN volunteer_assignments va ON v.volunteer_id = va.volunteer_id 
      WHERE va.event_id = ?`, 
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/volunteers/assign', async (req, res) => {
  try {
    const { volunteer_id, event_id, assigned_task } = req.body;
    const [result] = await db.query(
      "INSERT INTO volunteer_assignments (volunteer_id, event_id, assigned_task) VALUES (?, ?, ?)",
      [volunteer_id, event_id, assigned_task]
    );
    res.json({ success: true, assignmentId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Could not assign volunteer." });
  }
});

// --- FEEDBACK & INVITATIONS ---
app.post('/api/feedback', async (req, res) => {
  const { student_id, event_id, rating, comments } = req.body;
  
  try {
    // We skip feedback_id because the DB will now create it automatically
    const sql = "INSERT INTO feedback (user_id, event_id, rating, comments) VALUES (?, ?, ?, ?)";
    
    await db.query(sql, [
      student_id || 'STU01', 
      event_id, 
      rating || 5, 
      comments || ''
    ]);
    
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("FEEDBACK DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/participants/invite', async (req, res) => {
  const { student_id, event_id } = req.body;
  try {
    console.log(`Invitation simulated: Sent to Student ${student_id} for Event ${event_id}`);
    res.json({ success: true, message: "Invitation sent!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to process invitation" });
  }
});

// --- RESOURCES ---
app.post('/api/resources/request/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // FIXED: Correctly decrements available_count
    const [result] = await db.query(
      "UPDATE resources SET available_count = available_count - 1 WHERE resource_id = ? AND available_count > 0",
      [id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Out of stock" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM resources");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));