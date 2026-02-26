const express = require('express');
const cors = require('cors');
const db = require('./db');
const { trainAndPredictEvent } = require('./src/aiModelService');
const { analyzeSentiment } = require('./src/sentimentService');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const validateRequiredFields = (fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || `${value}`.trim() === "";
  });

  if (missing.length) {
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  return next();
};

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

app.get('/api/model-health', async (req, res) => {
  try {
    const [eventCountRows] = await db.query('SELECT COUNT(*) as totalEvents FROM events');
    const [feedbackCountRows] = await db.query('SELECT COUNT(*) as totalFeedback FROM feedback');
    res.json({
      totalEvents: Number(eventCountRows[0]?.totalEvents || 0),
      totalFeedback: Number(feedbackCountRows[0]?.totalFeedback || 0),
      status: 'healthy',
    });
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
app.post('/api/events', validateRequiredFields(['name', 'type', 'date']), async (req, res) => {
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

app.post('/api/ai/predict-event', async (req, res) => {
  try {
    const { name, type, description, budget } = req.body || {};
    if (![name, type, description].some((value) => String(value || '').trim())) {
      return res.status(400).json({ error: 'Provide at least one of name/type/description' });
    }
    const prediction = await trainAndPredictEvent(db, { name, type, description, budget });
    res.json(prediction);
  } catch (err) {
    console.error('AI PREDICTION ERROR:', err.message);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

app.get('/api/attendance-prediction/:eventName', async (req, res) => {
  try {
    const { eventName } = req.params;
    const prediction = await trainAndPredictEvent(db, { name: eventName });
    res.json({ predictedAttendance: prediction.predictedAttendance });
  } catch (err) {
    console.error('ATTENDANCE PREDICTION ERROR:', err.message);
    res.status(500).json({ error: 'Prediction failed' });
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

app.post('/api/volunteers/assign', validateRequiredFields(['volunteer_id', 'event_id', 'assigned_task']), async (req, res) => {
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
app.post('/api/feedback', validateRequiredFields(['event_id', 'rating']), async (req, res) => {
  const { student_id, event_id, rating, comments } = req.body;
  
  try {
    const sentiment = analyzeSentiment(comments || '');

    const [columnRows] = await db.query(
      `SELECT COLUMN_NAME, DATA_TYPE, EXTRA FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feedback'`
    );
    const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));
    const columnMeta = new Map(columnRows.map((row) => [row.COLUMN_NAME, row]));

    const insertColumns = [];
    const insertValues = [];

    if (columns.has('feedback_id')) {
      const feedbackIdMeta = columnMeta.get('feedback_id');
      const isAutoIncrement = String(feedbackIdMeta?.EXTRA || '').toLowerCase().includes('auto_increment');

      if (!isAutoIncrement) {
        const numericTypes = new Set(['int', 'bigint', 'smallint', 'mediumint', 'tinyint', 'decimal']);
        const isNumericId = numericTypes.has(String(feedbackIdMeta?.DATA_TYPE || '').toLowerCase());

        if (isNumericId) {
          const [maxRows] = await db.query('SELECT COALESCE(MAX(feedback_id), 0) as maxId FROM feedback');
          insertColumns.push('feedback_id');
          insertValues.push(Number(maxRows[0]?.maxId || 0) + 1);
        } else {
          const [lastIdRows] = await db.query(
            `SELECT feedback_id FROM feedback
             WHERE feedback_id REGEXP '^F[0-9]+$'
             ORDER BY CAST(SUBSTRING(feedback_id, 2) AS UNSIGNED) DESC LIMIT 1`
          );
          const last = lastIdRows[0]?.feedback_id || 'F000';
          const nextNumber = Number(String(last).slice(1)) + 1;
          const nextFeedbackId = `F${String(nextNumber).padStart(3, '0')}`;
          insertColumns.push('feedback_id');
          insertValues.push(nextFeedbackId);
        }
      }
    }

    if (columns.has('user_id')) {
      insertColumns.push('user_id');
      insertValues.push(student_id || 'U001');
    }

    if (columns.has('event_id')) {
      insertColumns.push('event_id');
      insertValues.push(event_id);
    }

    if (columns.has('rating')) {
      insertColumns.push('rating');
      insertValues.push(Number(rating) || 5);
    }

    const commentColumn = columns.has('comments') ? 'comments' : columns.has('comment') ? 'comment' : null;
    if (commentColumn) {
      insertColumns.push(commentColumn);
      insertValues.push(comments || '');
    }

    if (columns.has('sentiment_label')) {
      insertColumns.push('sentiment_label');
      insertValues.push(sentiment.label);
    }

    if (columns.has('sentiment_score')) {
      insertColumns.push('sentiment_score');
      insertValues.push(sentiment.score / 100);
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    const sql = `INSERT INTO feedback (${insertColumns.join(', ')}) VALUES (${placeholders})`;

    await db.query(sql, insertValues);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      sentiment,
    });
  } catch (err) {
    console.error("FEEDBACK DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feedback/trends/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const [columnRows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feedback'`
    );
    const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));
    const commentColumn = columns.has('comments') ? 'comments' : columns.has('comment') ? 'comment' : null;

    const selectColumns = ['rating'];
    if (columns.has('sentiment_label')) selectColumns.push('sentiment_label');
    if (columns.has('sentiment_score')) selectColumns.push('sentiment_score');
    if (commentColumn) selectColumns.push(commentColumn);

    const [rows] = await db.query(
      `SELECT ${selectColumns.join(', ')} FROM feedback WHERE event_id = ?`,
      [eventId]
    );

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let ratingSum = 0;

    rows.forEach((row) => {
      ratingSum += Number(row.rating || 0);
      const label = row.sentiment_label
        ? String(row.sentiment_label)
        : analyzeSentiment(commentColumn ? row[commentColumn] : '').label;

      const normalized = label.toLowerCase();
      if (normalized === 'positive') positive += 1;
      else if (normalized === 'negative') negative += 1;
      else neutral += 1;
    });

    const total = rows.length;
    res.json({
      positive,
      neutral,
      negative,
      total,
      averageRating: total ? ratingSum / total : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participants/invite', async (req, res) => {
  const { student_id, event_id } = req.body;
  if (!student_id || !event_id) {
    return res.status(400).json({ error: 'student_id and event_id are required' });
  }
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

const PORT = Number(process.env.PORT || 5000);
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the old process or run on a different PORT.`);
  } else {
    console.error('❌ Server startup failed:', error.message);
  }
  process.exit(1);
});