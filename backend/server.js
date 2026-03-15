const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');
const { trainAndPredictEvent, calculateModelMetrics, predictManyEvents } = require('./src/aiModelService');
const { analyzeSentiment } = require('./src/sentimentService');

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

let mailTransporter = null;

const getMailTransporter = () => {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return mailTransporter;
};

const sendParticipantInvitationEmail = async ({ toEmail, studentName, eventName, eventDate, location }) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error('SMTP is not configured. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS).');
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const safeDate = eventDate ? new Date(eventDate).toLocaleString() : 'Date to be announced';

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: `Invitation: ${eventName || 'Campus Event'}`,
    text: [
      `Hi ${studentName || 'Student'},`,
      '',
      `You are invited to ${eventName || 'a campus event'}.`,
      `Date: ${safeDate}`,
      `Location: ${location || 'Campus'}`,
      '',
      'Please check the Smart Event portal for details and registration.',
      '',
      'Regards,',
      'Smart Event Team',
    ].join('\n'),
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
  };
};

const buildCertificateHtml = ({ studentName, eventName, eventDate, certificateUrl, issuedAt }) => {
  const safeName = studentName || 'Student';
  const safeEvent = eventName || 'Campus Event';
  const safeDate = eventDate ? new Date(eventDate).toLocaleDateString() : 'N/A';
  const safeIssued = issuedAt ? new Date(issuedAt).toLocaleString() : new Date().toLocaleString();

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Participation Certificate</title>
  <style>
    body { margin: 0; background: #f3f8ff; font-family: Georgia, 'Times New Roman', serif; color: #102a43; }
    .page { max-width: 980px; margin: 24px auto; padding: 34px; }
    .card { border: 12px solid #d4af37; background: linear-gradient(180deg, #ffffff 0%, #f6fbff 100%); border-radius: 14px; padding: 36px; box-shadow: 0 14px 30px rgba(0, 30, 90, 0.15); }
    .top { text-align: center; letter-spacing: 2px; font-size: 14px; color: #334e68; text-transform: uppercase; }
    h1 { margin: 14px 0 6px; text-align: center; font-size: 42px; color: #102a43; }
    h2 { margin: 4px 0 30px; text-align: center; font-size: 20px; color: #486581; font-weight: normal; }
    .line { text-align: center; font-size: 20px; margin: 8px 0; }
    .name { text-align: center; margin: 20px 0; font-size: 46px; color: #0b3c5d; font-weight: bold; border-bottom: 2px solid #bcccdc; display: inline-block; padding: 0 20px 4px; }
    .name-wrap { text-align: center; }
    .event { text-align: center; margin-top: 20px; font-size: 30px; color: #1f2933; }
    .meta { margin-top: 34px; display: flex; justify-content: space-between; font-size: 15px; color: #486581; }
    .seal { margin-top: 24px; text-align: right; font-size: 13px; color: #627d98; }
    .view-link { margin-top: 10px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="top">ASIET Smart Event Management</div>
      <h1>Certificate of Participation</h1>
      <h2>This certifies that</h2>
      <div class="name-wrap"><div class="name">${safeName}</div></div>
      <div class="line">has successfully participated in</div>
      <div class="event">${safeEvent}</div>
      <div class="line">on ${safeDate}</div>
      <div class="meta">
        <div>Issued At: ${safeIssued}</div>
        <div>Smart Event Cell</div>
      </div>
      <div class="view-link">Online verification: ${certificateUrl}</div>
      <div class="seal">Digitally generated by ASIET Smart Event Platform</div>
    </div>
  </div>
</body>
</html>`;
};

const sendCertificateEmail = async ({ toEmail, studentName, eventName, eventDate, certificateUrl, issuedAt }) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error('SMTP is not configured. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS).');
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const html = buildCertificateHtml({ studentName, eventName, eventDate, certificateUrl, issuedAt });

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: `Your Certificate - ${eventName || 'Campus Event'}`,
    html,
    text: [
      `Hi ${studentName || 'Student'},`,
      '',
      `Congratulations on participating in ${eventName || 'the event'}.`,
      `Certificate Link: ${certificateUrl}`,
      '',
      'Regards,',
      'ASIET Smart Event Team',
    ].join('\n'),
    attachments: [
      {
        filename: `certificate-${String(eventName || 'event').replace(/\s+/g, '-').toLowerCase()}-${String(studentName || 'student').replace(/\s+/g, '-').toLowerCase()}.html`,
        content: html,
        contentType: 'text/html; charset=utf-8',
      },
    ],
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || [],
    rejected: info.rejected || [],
  };
};

const ensureCertificateDeliveryColumns = async () => {
  await ensureStudentFeatureTables();

  const [columnRows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates'`
  );
  const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));

  if (!columns.has('recipient_email')) {
    await db.query(`ALTER TABLE certificates ADD COLUMN recipient_email VARCHAR(190) NULL`);
  }
  if (!columns.has('emailed_at')) {
    await db.query(`ALTER TABLE certificates ADD COLUMN emailed_at DATETIME NULL`);
  }
  if (!columns.has('email_message_id')) {
    await db.query(`ALTER TABLE certificates ADD COLUMN email_message_id VARCHAR(255) NULL`);
  }
  if (!columns.has('delivery_status')) {
    await db.query(`ALTER TABLE certificates ADD COLUMN delivery_status VARCHAR(30) NULL`);
  }
};

const getCertificateEventRow = async (eventId) => {
  const [rows] = await db.query(
    `SELECT event_id, event_name, date
     FROM events
     WHERE event_id = ?
     LIMIT 1`,
    [eventId]
  );
  return rows[0] || null;
};

const getEligibleCertificateRecipients = async (eventId) => {
  const [rows] = await db.query(
    `SELECT r.user_id,
            COALESCE(NULLIF(u.name, ''), r.user_id) as student_name,
            NULLIF(u.email, '') as email,
            r.attended_at
     FROM event_registrations r
     LEFT JOIN users u ON u.user_id = r.user_id
     WHERE r.event_id = ?
       AND r.attended_at IS NOT NULL
     ORDER BY r.attended_at DESC`,
    [eventId]
  );

  return rows.map((row) => ({
    user_id: row.user_id,
    student_name: row.student_name,
    email: row.email,
    attended_at: row.attended_at,
  }));
};

const crowdLevelFromAttendance = (value) => {
  const count = Number(value || 0);
  if (count >= 500) return 'High';
  if (count >= 220) return 'Medium';
  return 'Low';
};

const toEventInput = (event) => ({
  name: event.event_name,
  type: event.type,
  description: event.description,
  budget: event.budget,
});

let studentFeatureTablesReady = false;

const ensureStudentFeatureTables = async () => {
  if (studentFeatureTablesReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      registration_id INT AUTO_INCREMENT PRIMARY KEY,
      event_id VARCHAR(50) NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'registered',
      reminder_opt_in TINYINT(1) NOT NULL DEFAULT 1,
      attended_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_event_user (event_id, user_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_gamification (
      user_id VARCHAR(50) PRIMARY KEY,
      streak_count INT NOT NULL DEFAULT 0,
      points INT NOT NULL DEFAULT 0,
      total_attended INT NOT NULL DEFAULT 0,
      certificates_earned INT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      certificate_id INT AUTO_INCREMENT PRIMARY KEY,
      event_id VARCHAR(50) NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      certificate_url VARCHAR(255) NULL,
      UNIQUE KEY uniq_cert_event_user (event_id, user_id)
    )
  `);

  studentFeatureTablesReady = true;
};

const toDateText = (value) => {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
};

const toLocalDateText = (value = new Date()) => {
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSeatLimitFromEvent = async (event) => {
  const explicit = Number(event?.expected_attendance || 0);
  if (explicit > 0) return explicit;

  const prediction = await trainAndPredictEvent(db, toEventInput(event || {}));
  return Math.max(40, Number(prediction?.predictedAttendance || 120));
};

const getSeatSnapshot = async (event) => {
  await ensureStudentFeatureTables();

  const seatLimit = await getSeatLimitFromEvent(event);

  const [countRows] = await db.query(
    `SELECT
      SUM(CASE WHEN status = 'registered' THEN 1 ELSE 0 END) as registeredCount,
      SUM(CASE WHEN status = 'waitlisted' THEN 1 ELSE 0 END) as waitlistCount
     FROM event_registrations
     WHERE event_id = ?`,
    [event.event_id]
  );

  const registeredCount = Number(countRows[0]?.registeredCount || 0);
  const waitlistCount = Number(countRows[0]?.waitlistCount || 0);
  const seatsLeft = Math.max(0, seatLimit - registeredCount);

  return {
    seatLimit,
    registeredCount,
    waitlistCount,
    seatsLeft,
    registrationClosed: seatsLeft <= 0,
  };
};

const buildIcsText = (event) => {
  const start = event?.date ? new Date(event.date) : new Date();
  const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = new Date(safeStart.getTime() + 2 * 60 * 60 * 1000);

  const toIcsStamp = (value) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const uid = `${event.event_id || 'event'}@asiet-smart-events`;
  const title = String(event.event_name || 'Campus Event').replace(/\n/g, ' ');
  const description = String(event.description || 'Smart Event').replace(/\n/g, ' ');
  const location = String(event.location || 'Campus').replace(/\n/g, ' ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ASIET//SmartEvent//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsStamp(new Date())}`,
    `DTSTART:${toIcsStamp(safeStart)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

let resourceFeatureTablesReady = false;

const ensureResourceFeatureTables = async () => {
  if (resourceFeatureTablesReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS resource_requests (
      request_id INT AUTO_INCREMENT PRIMARY KEY,
      resource_id VARCHAR(50) NOT NULL,
      event_id VARCHAR(50) NULL,
      user_id VARCHAR(50) NULL,
      quantity INT NOT NULL DEFAULT 1,
      returned_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  resourceFeatureTablesReady = true;
};

const reconcileResourceAvailability = async () => {
  await ensureResourceFeatureTables();

  const [pendingRows] = await db.query(
    `SELECT rr.request_id, rr.resource_id, rr.quantity
     FROM resource_requests rr
     JOIN events e ON e.event_id = rr.event_id
     WHERE rr.returned_at IS NULL
       AND rr.event_id IS NOT NULL
       AND (
         LOWER(COALESCE(e.status, '')) = 'completed'
         OR (e.date IS NOT NULL AND e.date < CURDATE())
       )`
  );

  for (const row of pendingRows) {
    const quantity = Math.max(1, Number(row.quantity || 1));

    await db.query(
      `UPDATE resources
       SET available_count = LEAST(total_count, available_count + ?)
       WHERE resource_id = ?`,
      [quantity, row.resource_id]
    );

    await db.query(
      `UPDATE resource_requests
       SET returned_at = NOW()
       WHERE request_id = ? AND returned_at IS NULL`,
      [row.request_id]
    );
  }

  return pendingRows.length;
};

const getFeedbackSummary = async (eventId) => {
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

  for (const row of rows) {
    ratingSum += Number(row.rating || 0);
    const label = row.sentiment_label
      ? String(row.sentiment_label)
      : analyzeSentiment(commentColumn ? row[commentColumn] : '').label;

    const normalized = label.toLowerCase();
    if (normalized === 'positive') positive += 1;
    else if (normalized === 'negative') negative += 1;
    else neutral += 1;
  }

  const total = rows.length;
  return {
    positive,
    neutral,
    negative,
    total,
    averageRating: total ? Number((ratingSum / total).toFixed(2)) : 0,
  };
};

// --- DASHBOARD & PARTICIPANTS ---
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1 as healthy');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

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

  const eventDateText = String(date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDateText)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  const todayText = toLocalDateText(new Date());
  if (todayText && eventDateText < todayText) {
    return res.status(400).json({ error: 'Event date cannot be in the past' });
  }

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

app.get('/api/events/discover', async (req, res) => {
  try {
    const mode = String(req.query.mode || 'all').toLowerCase();
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

    const [columnRows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events'`
    );
    const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));

    const selectColumns = ['event_id', 'event_name', 'type'];
    if (columns.has('date')) selectColumns.push('date');
    if (columns.has('location')) selectColumns.push('location');
    if (columns.has('description')) selectColumns.push('description');
    if (columns.has('status')) selectColumns.push('status');
    if (columns.has('budget')) selectColumns.push('budget');
    if (columns.has('expected_attendance')) selectColumns.push('expected_attendance');

    const whereClauses = [];
    const values = [];

    if (mode === 'current') {
      if (columns.has('date') && columns.has('status')) {
        whereClauses.push(`(date = CURDATE() OR LOWER(status) IN ('live', 'ongoing'))`);
      } else if (columns.has('date')) {
        whereClauses.push('date = CURDATE()');
      } else if (columns.has('status')) {
        whereClauses.push(`LOWER(status) IN ('live', 'ongoing')`);
      }
    }

    if (mode === 'upcoming') {
      if (columns.has('date') && columns.has('status')) {
        whereClauses.push(`(date >= CURDATE() AND LOWER(status) <> 'completed')`);
      } else if (columns.has('date')) {
        whereClauses.push('date >= CURDATE()');
      } else if (columns.has('status')) {
        whereClauses.push(`LOWER(status) IN ('planned', 'upcoming')`);
      }
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderSql = columns.has('date') ? 'ORDER BY date ASC' : 'ORDER BY event_id DESC';

    const [rows] = await db.query(
      `SELECT ${selectColumns.join(', ')} FROM events ${whereSql} ${orderSql} LIMIT ?`,
      [...values, limit]
    );

    const todayText = new Date().toISOString().slice(0, 10);
    const predictions = await predictManyEvents(db, rows.map(toEventInput));

    const events = rows.map((event, index) => {
      const eventDateText = event.date ? new Date(event.date).toISOString().slice(0, 10) : null;
      let timeline = 'Upcoming';

      const status = String(event.status || '').toLowerCase();
      if (status === 'completed') timeline = 'Completed';
      else if (status === 'live' || status === 'ongoing') timeline = 'Live';
      else if (eventDateText && eventDateText < todayText) timeline = 'Completed';
      else if (eventDateText && eventDateText === todayText) timeline = 'Live';

      const prediction = predictions[index] || {};
      const predictedAttendance = Number(prediction.predictedAttendance || event.expected_attendance || 0);

      return {
        ...event,
        timeline,
        predictedAttendance,
        predictionConfidence: Number(prediction.confidence || 0),
        crowdLevel: crowdLevelFromAttendance(predictedAttendance),
        recommendedVenue: prediction.recommendedVenue || null,
      };
    });

    res.json({
      mode,
      count: events.length,
      events,
    });
  } catch (err) {
    console.error('EVENT DISCOVERY ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch discover events' });
  }
});

app.get('/api/events/recommended', async (req, res) => {
  try {
    const department = String(req.query.department || '').toLowerCase();
    const interest = String(req.query.interest || '').toLowerCase();
    const userId = String(req.query.user_id || '').trim();
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 6)));

    const [rows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE (date >= CURDATE() OR LOWER(COALESCE(status, 'planned')) IN ('planned', 'upcoming', 'live', 'ongoing'))
       ORDER BY date ASC
       LIMIT 60`
    );

    const departmentHints = {
      cse: ['technical', 'workshop', 'hackathon', 'coding', 'ai', 'cloud'],
      ece: ['technical', 'electronics', 'robotics', 'iot'],
      eee: ['technical', 'power', 'electronics', 'innovation'],
      mechanical: ['technical', 'design', 'manufacturing', 'robotics'],
      civil: ['seminar', 'planning', 'sustainability', 'design'],
      mba: ['seminar', 'management', 'startup', 'leadership', 'business'],
    };

    const keywords = [interest, ...(departmentHints[department] || [])]
      .filter(Boolean)
      .map((word) => String(word).toLowerCase());

    const historySignals = [];
    if (userId) {
      await ensureStudentFeatureTables();
      const [historyRows] = await db.query(
        `SELECT e.type, e.event_name, e.description
         FROM event_registrations r
         JOIN events e ON e.event_id = r.event_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC
         LIMIT 10`,
        [userId]
      );

      for (const row of historyRows) {
        const words = `${row.type || ''} ${row.event_name || ''} ${row.description || ''}`
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((token) => token.length >= 4)
          .slice(0, 10);
        historySignals.push(...words);
      }
    }

    const scored = rows.map((event) => {
      const bag = `${event.event_name || ''} ${event.type || ''} ${event.description || ''}`.toLowerCase();
      let score = 0;

      for (const key of keywords) {
        if (bag.includes(key)) score += 3;
      }

      for (const key of historySignals) {
        if (bag.includes(key)) score += 1;
      }

      if (String(event.status || '').toLowerCase() === 'live') score += 2;
      if (event.date) {
        const dt = new Date(event.date).getTime();
        const daysAway = Math.max(0, (dt - Date.now()) / (1000 * 60 * 60 * 24));
        score += Math.max(0, 4 - Math.min(4, Math.floor(daysAway)));
      }

      return { ...event, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const selected = scored.slice(0, limit);

    const predictions = await predictManyEvents(db, selected.map(toEventInput));

    const events = selected.map((event, index) => {
      const prediction = predictions[index] || {};
      const predictedAttendance = Number(prediction.predictedAttendance || event.expected_attendance || 0);

      return {
        ...event,
        predictedAttendance,
        crowdLevel: crowdLevelFromAttendance(predictedAttendance),
        recommendedVenue: prediction.recommendedVenue || null,
      };
    });

    res.json({
      department,
      interest,
      userId,
      count: events.length,
      events,
    });
  } catch (err) {
    console.error('RECOMMENDED EVENTS ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch recommended events' });
  }
});

app.get('/api/events/:eventId/details', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = String(req.query.user_id || '').trim();
    const [rows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = rows[0];
    const prediction = await trainAndPredictEvent(db, toEventInput(event));
    const seatSnapshot = await getSeatSnapshot(event);
    const feedbackSummary = await getFeedbackSummary(eventId);

    let myRegistration = null;
    if (userId) {
      await ensureStudentFeatureTables();
      const [registrationRows] = await db.query(
        `SELECT event_id, user_id, status, reminder_opt_in, attended_at, created_at
         FROM event_registrations
         WHERE event_id = ? AND user_id = ?
         LIMIT 1`,
        [eventId, userId]
      );
      myRegistration = registrationRows[0] || null;
    }

    const [relatedRows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE event_id <> ?
         AND (type = ? OR date >= CURDATE())
       ORDER BY (type = ?) DESC, date ASC
       LIMIT 6`,
      [eventId, event.type, event.type]
    );

    const relatedPredictions = await predictManyEvents(db, relatedRows.map(toEventInput));

    const relatedEvents = relatedRows.map((row, index) => {
      const itemPrediction = relatedPredictions[index] || {};
      const predictedAttendance = Number(itemPrediction.predictedAttendance || row.expected_attendance || 0);

      return {
        ...row,
        predictedAttendance,
        crowdLevel: crowdLevelFromAttendance(predictedAttendance),
      };
    });

    res.json({
      event: {
        ...event,
        predictedAttendance: prediction.predictedAttendance,
        crowdLevel: crowdLevelFromAttendance(prediction.predictedAttendance),
        recommendedVenue: prediction.recommendedVenue,
        predictionConfidence: prediction.confidence,
        seats: seatSnapshot,
        myRegistration,
        feedbackSummary,
      },
      relatedEvents,
    });
  } catch (err) {
    console.error('EVENT DETAILS ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch event details' });
  }
});

app.post('/api/events/:eventId/register', validateRequiredFields(['user_id']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = String(req.body.user_id || '').trim();
    const reminderOptIn = req.body.reminder_opt_in === undefined ? 1 : Number(Boolean(req.body.reminder_opt_in));

    const [eventRows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await ensureStudentFeatureTables();
    const event = eventRows[0];
    const seats = await getSeatSnapshot(event);

    const [existingRows] = await db.query(
      `SELECT event_id, user_id, status, reminder_opt_in, attended_at, created_at
       FROM event_registrations
       WHERE event_id = ? AND user_id = ?
       LIMIT 1`,
      [eventId, userId]
    );

    if (existingRows.length) {
      return res.json({
        success: true,
        message: `Already ${existingRows[0].status}`,
        registration: existingRows[0],
        seats,
      });
    }

    const status = seats.seatsLeft > 0 ? 'registered' : 'waitlisted';

    await db.query(
      `INSERT INTO event_registrations (event_id, user_id, status, reminder_opt_in)
       VALUES (?, ?, ?, ?)`,
      [eventId, userId, status, reminderOptIn]
    );

    const updatedSeats = await getSeatSnapshot(event);
    const [registrationRows] = await db.query(
      `SELECT event_id, user_id, status, reminder_opt_in, attended_at, created_at
       FROM event_registrations
       WHERE event_id = ? AND user_id = ?
       LIMIT 1`,
      [eventId, userId]
    );

    res.json({
      success: true,
      message: status === 'registered' ? 'Registration confirmed' : 'Added to waitlist',
      registration: registrationRows[0],
      seats: updatedSeats,
    });
  } catch (err) {
    console.error('EVENT REGISTRATION ERROR:', err.message);
    res.status(500).json({ error: 'Could not complete registration' });
  }
});

app.get('/api/events/:eventId/registration-status', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = String(req.query.user_id || '').trim();
    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const [eventRows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await ensureStudentFeatureTables();
    const seats = await getSeatSnapshot(eventRows[0]);

    const [rows] = await db.query(
      `SELECT event_id, user_id, status, reminder_opt_in, attended_at, created_at
       FROM event_registrations
       WHERE event_id = ? AND user_id = ?
       LIMIT 1`,
      [eventId, userId]
    );

    res.json({
      registration: rows[0] || null,
      seats,
    });
  } catch (err) {
    console.error('REGISTRATION STATUS ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch registration status' });
  }
});

app.post('/api/events/:eventId/check-in', validateRequiredFields(['user_id']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = String(req.body.user_id || '').trim();

    await ensureStudentFeatureTables();

    const [registrationRows] = await db.query(
      `SELECT event_id, user_id, status, attended_at
       FROM event_registrations
       WHERE event_id = ? AND user_id = ?
       LIMIT 1`,
      [eventId, userId]
    );

    if (!registrationRows.length) {
      return res.status(400).json({ error: 'Student is not registered for this event' });
    }

    await db.query(
      `UPDATE event_registrations
       SET status = 'registered', attended_at = COALESCE(attended_at, NOW())
       WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    const [attendedRows] = await db.query(
      `SELECT DATE(attended_at) as attendedDate
       FROM event_registrations
       WHERE user_id = ? AND attended_at IS NOT NULL
       ORDER BY attended_at DESC`,
      [userId]
    );

    const uniqueDates = [...new Set(attendedRows.map((row) => toDateText(row.attendedDate)).filter(Boolean))];
    let streak = 0;
    if (uniqueDates.length) {
      const dayMs = 24 * 60 * 60 * 1000;
      const normalized = uniqueDates.map((text) => new Date(text));
      streak = 1;
      for (let index = 1; index < normalized.length; index += 1) {
        const prev = normalized[index - 1].getTime();
        const curr = normalized[index].getTime();
        const diffDays = Math.round((prev - curr) / dayMs);
        if (diffDays <= 1) streak += 1;
        else break;
      }
    }

    const totalAttended = uniqueDates.length;
    const points = totalAttended * 10 + streak * 5;

    await db.query(
      `INSERT INTO student_gamification (user_id, streak_count, points, total_attended, certificates_earned)
       VALUES (?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         streak_count = VALUES(streak_count),
         points = VALUES(points),
         total_attended = VALUES(total_attended)`,
      [userId, streak, points, totalAttended]
    );

    await db.query(
      `INSERT IGNORE INTO certificates (event_id, user_id, certificate_url)
       VALUES (?, ?, ?)`,
      [eventId, userId, `https://certificates.asiet.local/${encodeURIComponent(eventId)}/${encodeURIComponent(userId)}`]
    );

    const [certCountRows] = await db.query(
      `SELECT COUNT(*) as total FROM certificates WHERE user_id = ?`,
      [userId]
    );

    await db.query(
      `UPDATE student_gamification
       SET certificates_earned = ?
       WHERE user_id = ?`,
      [Number(certCountRows[0]?.total || 0), userId]
    );

    res.json({
      success: true,
      message: 'Attendance check-in successful',
      gamification: {
        streakCount: streak,
        points,
        totalAttended,
        certificatesEarned: Number(certCountRows[0]?.total || 0),
      },
    });
  } catch (err) {
    console.error('CHECK-IN ERROR:', err.message);
    res.status(500).json({ error: 'Could not check in student' });
  }
});

app.get('/api/students/:studentId/gamification', async (req, res) => {
  try {
    const { studentId } = req.params;
    await ensureStudentFeatureTables();

    const [profileRows] = await db.query(
      `SELECT user_id, streak_count, points, total_attended, certificates_earned
       FROM student_gamification
       WHERE user_id = ?
       LIMIT 1`,
      [studentId]
    );

    const [certificateRows] = await db.query(
      `SELECT certificate_id, event_id, issued_at, certificate_url
       FROM certificates
       WHERE user_id = ?
       ORDER BY issued_at DESC
       LIMIT 10`,
      [studentId]
    );

    res.json({
      profile: profileRows[0] || {
        user_id: studentId,
        streak_count: 0,
        points: 0,
        total_attended: 0,
        certificates_earned: 0,
      },
      certificates: certificateRows,
    });
  } catch (err) {
    console.error('GAMIFICATION ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch gamification profile' });
  }
});

app.get('/api/students/:studentId/reminders', async (req, res) => {
  try {
    const { studentId } = req.params;
    await ensureStudentFeatureTables();

    const [rows] = await db.query(
      `SELECT e.event_id, e.event_name, e.date, e.location, r.status, r.reminder_opt_in
       FROM event_registrations r
       JOIN events e ON e.event_id = r.event_id
       WHERE r.user_id = ?
         AND r.reminder_opt_in = 1
         AND r.status IN ('registered', 'waitlisted')
         AND e.date IS NOT NULL`,
      [studentId]
    );

    const now = Date.now();
    const reminderWindowMs = 30 * 60 * 1000;

    const reminders = rows
      .map((row) => {
        const startsAt = new Date(row.date).getTime();
        if (Number.isNaN(startsAt)) return null;
        const diff = startsAt - now;
        if (diff < 0 || diff > reminderWindowMs) return null;
        return {
          event_id: row.event_id,
          event_name: row.event_name,
          location: row.location || 'Campus',
          startsInMinutes: Math.max(0, Math.round(diff / 60000)),
          message: `${row.event_name} is starting in ${Math.max(0, Math.round(diff / 60000))} mins`,
        };
      })
      .filter(Boolean);

    res.json({
      count: reminders.length,
      reminders,
    });
  } catch (err) {
    console.error('REMINDERS ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch reminders' });
  }
});

app.get('/api/events/:eventId/calendar.ics', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.query(
      `SELECT event_id, event_name, date, location, description
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    if (!rows.length) {
      return res.status(404).send('Event not found');
    }

    const icsText = buildIcsText(rows[0]);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].event_id || 'event'}.ics"`);
    res.send(icsText);
  } catch (err) {
    console.error('CALENDAR EXPORT ERROR:', err.message);
    res.status(500).json({ error: 'Could not export calendar file' });
  }
});

app.post('/api/events/:eventId/qa', validateRequiredFields(['question']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const question = String(req.body.question || '').toLowerCase();
    const userId = String(req.body.user_id || '').trim();

    const [rows] = await db.query(
      `SELECT event_id, event_name, type, date, location, description, status, budget, expected_attendance
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = rows[0];
    const seats = await getSeatSnapshot(event);

    let registrationStatus = null;
    if (userId) {
      await ensureStudentFeatureTables();
      const [regRows] = await db.query(
        `SELECT status FROM event_registrations WHERE event_id = ? AND user_id = ? LIMIT 1`,
        [eventId, userId]
      );
      registrationStatus = regRows[0]?.status || null;
    }

    let answer = 'Please check event details for full information.';

    if (/where|venue|location|map/.test(question)) {
      answer = `The venue is ${event.location || 'Campus Main'}. You can also check the AI suggested venue in the event details card.`;
    } else if (/bring|what to bring|required/.test(question)) {
      answer = `Bring your student ID, notebook, and essentials for a ${event.type || 'general'} event. For technical events, bring a charged laptop if possible.`;
    } else if (/register|registration|closed|seat|waitlist/.test(question)) {
      if (registrationStatus) {
        answer = `Your current status is ${registrationStatus}. Seats left: ${seats.seatsLeft}. Waitlist size: ${seats.waitlistCount}.`;
      } else {
        answer = seats.seatsLeft > 0
          ? `Registration is open. Seats left: ${seats.seatsLeft}.`
          : `Direct seats are full. You can still join the waitlist (current waitlist: ${seats.waitlistCount}).`;
      }
    } else if (/time|when|start/.test(question)) {
      answer = `The event starts on ${event.date ? new Date(event.date).toLocaleString() : 'the scheduled time shown in details'}.`;
    }

    res.json({
      question: req.body.question,
      answer,
    });
  } catch (err) {
    console.error('EVENT QA ERROR:', err.message);
    res.status(500).json({ error: 'Could not answer the question' });
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

app.get('/api/ai/model-metrics', async (req, res) => {
  try {
    const metrics = await calculateModelMetrics(db);
    res.json(metrics);
  } catch (err) {
    console.error('MODEL METRICS ERROR:', err.message);
    res.status(500).json({ error: 'Could not compute model metrics' });
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

app.post('/api/volunteers/auto-assign/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const [eventRows] = await db.query(
      `SELECT event_id, event_name, type, description
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];
    const [volunteers] = await db.query(`SELECT volunteer_id, name, skills FROM volunteers`);
    const [assignedRows] = await db.query(
      `SELECT volunteer_id, assigned_task FROM volunteer_assignments WHERE event_id = ?`,
      [eventId]
    );

    const assignedVolunteerIds = new Set(assignedRows.map((row) => row.volunteer_id));
    const freeVolunteers = volunteers.filter((item) => !assignedVolunteerIds.has(item.volunteer_id));

    const typeText = String(event.type || '').toLowerCase();
    const profileText = `${event.event_name || ''} ${event.description || ''} ${event.type || ''}`.toLowerCase();

    let taskTemplates = [
      { task: 'Registration Desk Management', keywords: ['registration', 'help desk', 'management', 'support'] },
      { task: 'Stage Coordination', keywords: ['stage', 'setup', 'coordination', 'organizing'] },
      { task: 'Technical Support Desk', keywords: ['technical', 'it', 'networking', 'sound'] },
      { task: 'Photography & Media Coverage', keywords: ['photography', 'media', 'creative', 'documentation'] },
    ];

    if (/(workshop|technical|hackathon|seminar)/.test(typeText) || /(ai|coding|tech|robotics)/.test(profileText)) {
      taskTemplates = [
        { task: 'Technical Setup & AV Check', keywords: ['technical', 'it support', 'sound system', 'electrical'] },
        { task: 'Registration & Help Desk', keywords: ['registration desk', 'help desk', 'management'] },
        { task: 'Speaker/Guest Coordination', keywords: ['coordination', 'public speaking', 'hosting'] },
        { task: 'Live Documentation & Media', keywords: ['photography', 'documentation', 'media', 'promotion'] },
      ];
    } else if (/(cultural|fest|arts|music)/.test(typeText) || /(dance|music|cultural)/.test(profileText)) {
      taskTemplates = [
        { task: 'Stage & Performance Flow', keywords: ['stage setup', 'event handling', 'organizing'] },
        { task: 'Audience Help Desk', keywords: ['help desk', 'management', 'support'] },
        { task: 'Backstage Coordination', keywords: ['coordination', 'logistics', 'setup'] },
        { task: 'Photography & Social Media', keywords: ['photography', 'media', 'promotion', 'creative'] },
      ];
    } else if (/(sports|game|tournament)/.test(typeText) || /(sports|match|tournament)/.test(profileText)) {
      taskTemplates = [
        { task: 'Ground/Equipment Setup', keywords: ['setup', 'logistics', 'support'] },
        { task: 'Participant Registration', keywords: ['registration desk', 'help desk', 'management'] },
        { task: 'Safety & Discipline', keywords: ['security', 'coordination'] },
        { task: 'Score/Media Desk', keywords: ['documentation', 'media', 'it support'] },
      ];
    }

    const pickBestVolunteer = (keywords, usedIds) => {
      const normalizedKeywords = keywords.map((word) => String(word).toLowerCase());

      const scored = freeVolunteers
        .filter((vol) => !usedIds.has(vol.volunteer_id))
        .map((vol) => {
          const skillText = String(vol.skills || '').toLowerCase();
          const score = normalizedKeywords.reduce((sum, word) => (skillText.includes(word) ? sum + 1 : sum), 0);
          return { vol, score };
        })
        .sort((a, b) => b.score - a.score || String(a.vol.volunteer_id).localeCompare(String(b.vol.volunteer_id)));

      return scored[0]?.vol || null;
    };

    const usedIds = new Set();
    const created = [];

    for (const template of taskTemplates) {
      const volunteer = pickBestVolunteer(template.keywords, usedIds);
      if (!volunteer) continue;

      usedIds.add(volunteer.volunteer_id);

      const [existingRows] = await db.query(
        `SELECT assignment_id
         FROM volunteer_assignments
         WHERE event_id = ? AND volunteer_id = ? AND assigned_task = ?
         LIMIT 1`,
        [eventId, volunteer.volunteer_id, template.task]
      );

      if (existingRows.length) continue;

      const [insertResult] = await db.query(
        `INSERT INTO volunteer_assignments (volunteer_id, event_id, assigned_task)
         VALUES (?, ?, ?)`,
        [volunteer.volunteer_id, eventId, template.task]
      );

      created.push({
        assignmentId: insertResult.insertId,
        volunteer_id: volunteer.volunteer_id,
        volunteer_name: volunteer.name,
        volunteer_skill: volunteer.skills,
        assigned_task: template.task,
      });
    }

    res.json({
      success: true,
      event_id: eventId,
      createdCount: created.length,
      createdAssignments: created,
    });
  } catch (err) {
    console.error('AUTO ASSIGN ERROR:', err.message);
    res.status(500).json({ error: 'Could not auto-assign volunteers' });
  }
});

// --- FEEDBACK & INVITATIONS ---
app.post('/api/feedback', validateRequiredFields(['student_id', 'event_id', 'rating']), async (req, res) => {
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
      insertValues.push(student_id);
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
    const summary = await getFeedbackSummary(eventId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participants/invite', async (req, res) => {
  const { student_id, event_id, test_email } = req.body;
  if (!student_id || !event_id) {
    return res.status(400).json({ error: 'student_id and event_id are required' });
  }

  try {
    const [userTableRows] = await db.query(
      `SELECT COUNT(*) as total
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );

    let student = { user_id: student_id, name: student_id, email: null };

    if (Number(userTableRows[0]?.total || 0) > 0) {
      const [studentRows] = await db.query(
        `SELECT user_id, name, email FROM users WHERE user_id = ? LIMIT 1`,
        [student_id]
      );

      if (studentRows.length) {
        student = studentRows[0];
      }
    }

    const [eventColumnRows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events'`
    );

    const eventColumns = new Set(eventColumnRows.map((row) => row.COLUMN_NAME));
    const eventIdColumn = eventColumns.has('event_id') ? 'event_id' : eventColumns.has('id') ? 'id' : null;
    const eventNameColumn = eventColumns.has('event_name') ? 'event_name' : eventColumns.has('name') ? 'name' : null;
    const eventDateColumn = eventColumns.has('date') ? 'date' : eventColumns.has('event_date') ? 'event_date' : null;
    const eventLocationColumn = eventColumns.has('location')
      ? 'location'
      : eventColumns.has('venue')
      ? 'venue'
      : null;

    if (!eventIdColumn || !eventNameColumn) {
      return res.status(500).json({ error: 'Events table is missing required columns for invitations' });
    }

    const dateSelect = eventDateColumn ? `${eventDateColumn} as event_date` : 'NULL as event_date';
    const locationSelect = eventLocationColumn ? `${eventLocationColumn} as event_location` : `'Campus' as event_location`;

    let lookupEventId = event_id;
    if (eventIdColumn === 'id' && typeof event_id === 'string' && /^E\d+$/i.test(event_id)) {
      lookupEventId = Number(event_id.replace(/[^0-9]/g, ''));
    }

    const [eventRows] = await db.query(
      `SELECT ${eventIdColumn} as event_id, ${eventNameColumn} as event_name, ${dateSelect}, ${locationSelect}
       FROM events WHERE ${eventIdColumn} = ? LIMIT 1`,
      [lookupEventId]
    );
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];
    const targetEmail = String(test_email || student.email || '').trim();

    if (!targetEmail) {
      return res.status(400).json({
        error: 'No target email found. Provide test_email or store student email in users.email',
      });
    }

    const sent = await sendParticipantInvitationEmail({
      toEmail: targetEmail,
      studentName: student.name,
      eventName: event.event_name,
      eventDate: event.event_date,
      location: event.event_location,
    });

    const [inviteTableRows] = await db.query(
      `SELECT COUNT(*) as total
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_invitations'`
    );

    if (Number(inviteTableRows[0]?.total || 0) > 0) {
      const [inviteColumnRows] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_invitations'`
      );
      const inviteColumns = new Set(inviteColumnRows.map((row) => row.COLUMN_NAME));

      const insertColumns = [];
      const insertValues = [];

      if (inviteColumns.has('event_id')) {
        insertColumns.push('event_id');
        insertValues.push(event.event_id);
      }
      if (inviteColumns.has('participant_email')) {
        insertColumns.push('participant_email');
        insertValues.push(targetEmail);
      } else if (inviteColumns.has('email')) {
        insertColumns.push('email');
        insertValues.push(targetEmail);
      }
      if (inviteColumns.has('participant_name')) {
        insertColumns.push('participant_name');
        insertValues.push(student.name || student.user_id || student_id);
      } else if (inviteColumns.has('name')) {
        insertColumns.push('name');
        insertValues.push(student.name || student.user_id || student_id);
      }
      if (inviteColumns.has('invitation_status')) {
        insertColumns.push('invitation_status');
        insertValues.push('sent');
      }

      if (insertColumns.length) {
        const placeholders = insertColumns.map(() => '?').join(', ');
        await db.query(
          `INSERT INTO event_invitations (${insertColumns.join(', ')}) VALUES (${placeholders})`,
          insertValues
        );
      }
    }

    res.json({
      success: true,
      message: `Invitation email sent to ${targetEmail}`,
      delivery: sent,
    });
  } catch (err) {
    console.error('INVITE EMAIL ERROR:', err.message);
    res.status(500).json({ error: err.message || "Failed to process invitation" });
  }
});

app.get('/api/certificates/events', async (req, res) => {
  try {
    await ensureCertificateDeliveryColumns();

    const [rows] = await db.query(
      `SELECT e.event_id,
              e.event_name,
              e.date,
              SUM(CASE WHEN r.attended_at IS NOT NULL THEN 1 ELSE 0 END) as attended_count,
              SUM(CASE WHEN c.delivery_status = 'sent' THEN 1 ELSE 0 END) as sent_count
       FROM events e
       LEFT JOIN event_registrations r ON r.event_id = e.event_id
       LEFT JOIN certificates c ON c.event_id = e.event_id
       GROUP BY e.event_id, e.event_name, e.date
       ORDER BY e.date DESC`
    );

    res.json({ events: rows });
  } catch (err) {
    console.error('CERTIFICATE EVENTS ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch certificate event list' });
  }
});

app.get('/api/certificates/event/:eventId/eligible', async (req, res) => {
  try {
    const { eventId } = req.params;
    await ensureCertificateDeliveryColumns();

    const event = await getCertificateEventRow(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const recipients = await getEligibleCertificateRecipients(eventId);
    const withEmail = recipients.filter((item) => item.email).length;
    const withoutEmail = recipients.length - withEmail;

    res.json({
      event,
      summary: {
        eligibleCount: recipients.length,
        withEmail,
        withoutEmail,
      },
      recipients,
    });
  } catch (err) {
    console.error('CERTIFICATE ELIGIBLE ERROR:', err.message);
    res.status(500).json({ error: 'Could not fetch certificate eligibility data' });
  }
});

app.post('/api/certificates/generate-send/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const testEmail = String(req.body?.test_email || '').trim() || null;
    await ensureCertificateDeliveryColumns();

    const event = await getCertificateEventRow(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const recipients = await getEligibleCertificateRecipients(eventId);
    if (!recipients.length) {
      return res.status(400).json({ error: 'No attended participants found for this event' });
    }

    const platformBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${Number(process.env.PORT || 5000)}`;
    const results = [];

    for (const recipient of recipients) {
      const targetEmail = testEmail || recipient.email;
      const certificateUrl = `${platformBaseUrl}/api/certificates/view/${encodeURIComponent(eventId)}/${encodeURIComponent(recipient.user_id)}`;

      await db.query(
        `INSERT INTO certificates (event_id, user_id, certificate_url, recipient_email, delivery_status)
         VALUES (?, ?, ?, ?, 'pending')
         ON DUPLICATE KEY UPDATE
           certificate_url = VALUES(certificate_url),
           recipient_email = VALUES(recipient_email),
           delivery_status = 'pending'`,
        [eventId, recipient.user_id, certificateUrl, targetEmail || recipient.email || null]
      );

      if (!targetEmail) {
        await db.query(
          `UPDATE certificates
           SET delivery_status = 'skipped_no_email', emailed_at = NULL, email_message_id = NULL
           WHERE event_id = ? AND user_id = ?`,
          [eventId, recipient.user_id]
        );

        results.push({
          user_id: recipient.user_id,
          student_name: recipient.student_name,
          email: null,
          status: 'skipped_no_email',
          certificate_url: certificateUrl,
        });
        continue;
      }

      try {
        const delivery = await sendCertificateEmail({
          toEmail: targetEmail,
          studentName: recipient.student_name,
          eventName: event.event_name,
          eventDate: event.date,
          certificateUrl,
          issuedAt: recipient.attended_at || new Date(),
        });

        await db.query(
          `UPDATE certificates
           SET delivery_status = 'sent', emailed_at = NOW(), email_message_id = ?
           WHERE event_id = ? AND user_id = ?`,
          [delivery.messageId || null, eventId, recipient.user_id]
        );

        results.push({
          user_id: recipient.user_id,
          student_name: recipient.student_name,
          email: targetEmail,
          status: 'sent',
          message_id: delivery.messageId || null,
          certificate_url: certificateUrl,
        });
      } catch (mailError) {
        await db.query(
          `UPDATE certificates
           SET delivery_status = 'failed', emailed_at = NULL, email_message_id = NULL
           WHERE event_id = ? AND user_id = ?`,
          [eventId, recipient.user_id]
        );

        results.push({
          user_id: recipient.user_id,
          student_name: recipient.student_name,
          email: targetEmail,
          status: 'failed',
          error: mailError.message,
          certificate_url: certificateUrl,
        });
      }
    }

    const sentCount = results.filter((item) => item.status === 'sent').length;
    const failedCount = results.filter((item) => item.status === 'failed').length;
    const skippedCount = results.filter((item) => item.status === 'skipped_no_email').length;

    res.json({
      success: true,
      event: {
        event_id: event.event_id,
        event_name: event.event_name,
        date: event.date,
      },
      summary: {
        totalEligible: recipients.length,
        sentCount,
        failedCount,
        skippedCount,
      },
      results,
    });
  } catch (err) {
    console.error('CERTIFICATE SEND ERROR:', err.message);
    res.status(500).json({ error: err.message || 'Could not generate and send certificates' });
  }
});

app.get('/api/certificates/view/:eventId/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    await ensureCertificateDeliveryColumns();

    const [rows] = await db.query(
      `SELECT c.event_id,
              c.user_id,
              c.issued_at,
              c.certificate_url,
              e.event_name,
              e.date as event_date,
              COALESCE(NULLIF(u.name, ''), c.user_id) as student_name
       FROM certificates c
       JOIN events e ON e.event_id = c.event_id
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE c.event_id = ? AND c.user_id = ?
       LIMIT 1`,
      [eventId, userId]
    );

    if (!rows.length) {
      return res.status(404).send('Certificate not found');
    }

    const row = rows[0];
    const html = buildCertificateHtml({
      studentName: row.student_name,
      eventName: row.event_name,
      eventDate: row.event_date,
      certificateUrl: row.certificate_url,
      issuedAt: row.issued_at,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('CERTIFICATE VIEW ERROR:', err.message);
    res.status(500).send('Could not render certificate');
  }
});

// --- RESOURCES ---
app.post('/api/resources/request/:id', async (req, res) => {
  const { id } = req.params;
  const eventId = String(req.body?.event_id || '').trim();
  const userId = String(req.body?.user_id || '').trim() || null;
  const quantity = Math.max(1, Number(req.body?.quantity || 1));

  if (!eventId) {
    return res.status(400).json({ error: 'event_id is required for resource tracking' });
  }

  try {
    await reconcileResourceAvailability();

    const [eventColumnRows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events'`
    );
    const eventColumns = new Set(eventColumnRows.map((row) => row.COLUMN_NAME));

    const eventIdColumn = eventColumns.has('event_id') ? 'event_id' : eventColumns.has('id') ? 'id' : null;
    if (!eventIdColumn) {
      return res.status(500).json({ error: 'Events table is missing event identifier column' });
    }

    const dateSelect = eventColumns.has('date') ? 'date as event_date' : eventColumns.has('event_date') ? 'event_date as event_date' : 'NULL as event_date';
    const statusSelect = eventColumns.has('status') ? 'status as event_status' : "'planned' as event_status";

    let lookupEventId = eventId;
    if (eventIdColumn === 'id' && /^E\d+$/i.test(eventId)) {
      lookupEventId = Number(eventId.replace(/[^0-9]/g, ''));
    }

    const [eventRows] = await db.query(
      `SELECT ${eventIdColumn} as event_id, ${dateSelect}, ${statusSelect}
       FROM events
       WHERE ${eventIdColumn} = ?
       LIMIT 1`,
      [lookupEventId]
    );
    if (!eventRows.length) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];
    const status = String(event.event_status || '').toLowerCase();
    const eventDateText = toDateText(event.event_date);
    const todayText = toDateText(new Date());

    if (status === 'completed' || (eventDateText && todayText && eventDateText < todayText)) {
      return res.status(400).json({
        error: 'Cannot allocate resources to completed/past events. Choose an ongoing or upcoming event.',
      });
    }

    const [result] = await db.query(
      `UPDATE resources
       SET available_count = available_count - ?
       WHERE resource_id = ? AND available_count >= ?`,
      [quantity, id, quantity]
    );

    if (result.affectedRows > 0) {
      await ensureResourceFeatureTables();
      await db.query(
        `INSERT INTO resource_requests (resource_id, event_id, user_id, quantity)
         VALUES (?, ?, ?, ?)`,
        [id, String(event.event_id), userId, quantity]
      );
      res.json({ success: true, message: 'Resource allocated to event' });
    } else {
      res.status(400).json({ error: "Out of stock" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources', async (req, res) => {
  try {
    const releasedCount = await reconcileResourceAvailability();
    const [rows] = await db.query("SELECT * FROM resources");
    res.json({
      autoReleasedCount: releasedCount,
      resources: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources/allocations', async (req, res) => {
  const eventId = String(req.query.event_id || '').trim();
  if (!eventId) {
    return res.status(400).json({ error: 'event_id is required' });
  }

  try {
    await ensureResourceFeatureTables();

    const [rows] = await db.query(
      `SELECT resource_id, COALESCE(SUM(quantity), 0) as allocated_count
       FROM resource_requests
       WHERE event_id = ? AND returned_at IS NULL
       GROUP BY resource_id`,
      [eventId]
    );

    const allocations = {};
    for (const row of rows) {
      allocations[String(row.resource_id)] = Number(row.allocated_count || 0);
    }

    res.json({
      event_id: eventId,
      allocations,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch allocations' });
  }
});

app.post('/api/resources/return/:id', async (req, res) => {
  const { id } = req.params;
  const eventId = String(req.body?.event_id || '').trim();
  const userId = String(req.body?.user_id || '').trim() || null;
  const requestedReturn = Math.max(1, Number(req.body?.quantity || 1));

  if (!eventId) {
    return res.status(400).json({ error: 'event_id is required for return tracking' });
  }

  try {
    await ensureResourceFeatureTables();

    const userFilterSql = userId ? 'AND user_id = ?' : '';
    const queryArgs = userId ? [id, eventId, userId] : [id, eventId];

    const [requestRows] = await db.query(
      `SELECT request_id, quantity
       FROM resource_requests
       WHERE resource_id = ?
         AND event_id = ?
         AND returned_at IS NULL
         ${userFilterSql}
       ORDER BY created_at DESC
       LIMIT 1`,
      queryArgs
    );

    if (!requestRows.length) {
      return res.status(400).json({ error: 'No active allocation found to return for this event/resource' });
    }

    const request = requestRows[0];
    const activeQuantity = Math.max(1, Number(request.quantity || 1));
    const returnQuantity = Math.min(activeQuantity, requestedReturn);

    if (returnQuantity >= activeQuantity) {
      await db.query(
        `UPDATE resource_requests
         SET returned_at = NOW()
         WHERE request_id = ?`,
        [request.request_id]
      );
    } else {
      await db.query(
        `UPDATE resource_requests
         SET quantity = quantity - ?
         WHERE request_id = ?`,
        [returnQuantity, request.request_id]
      );
    }

    await db.query(
      `UPDATE resources
       SET available_count = LEAST(total_count, available_count + ?)
       WHERE resource_id = ?`,
      [returnQuantity, id]
    );

    res.json({
      success: true,
      returnedQuantity: returnQuantity,
      message: 'Resource returned to inventory',
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not return resource' });
  }
});

app.post('/api/students/session', validateRequiredFields(['user_id']), async (req, res) => {
  try {
    const userId = String(req.body.user_id || '').trim();
    const [rows] = await db.query(
      `SELECT user_id, name, department, role
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];
    if (String(student.role || '').toLowerCase() !== 'student') {
      return res.status(403).json({ error: 'User is not a student account' });
    }

    res.json({
      session: {
        user_id: student.user_id,
        name: student.name,
        department: student.department,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not create student session' });
  }
});

app.post('/api/students/register', validateRequiredFields(['user_id', 'name', 'department']), async (req, res) => {
  try {
    const rawUserId = String(req.body.user_id || '').trim();
    const userId = rawUserId.replace(/\s+/g, '').toUpperCase();
    const name = String(req.body.name || '').trim();
    const department = String(req.body.department || '').trim();
    const email = String(req.body.email || '').trim() || null;
    const password = String(req.body.password || '').trim() || null;

    if (userId.length < 3 || userId.length > 20) {
      return res.status(400).json({ error: 'Student ID must be between 3 and 20 characters' });
    }

    if (!/^[A-Z0-9._-]+$/.test(userId)) {
      return res.status(400).json({ error: 'Student ID can use letters, numbers, dot, underscore, and hyphen only' });
    }

    const [existingRows] = await db.query(
      `SELECT user_id FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (existingRows.length) {
      return res.status(409).json({ error: 'Student ID already exists' });
    }

    const [columnRows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));

    const insertColumns = [];
    const insertValues = [];

    if (columns.has('user_id')) {
      insertColumns.push('user_id');
      insertValues.push(userId);
    }
    if (columns.has('name')) {
      insertColumns.push('name');
      insertValues.push(name);
    }
    if (columns.has('role')) {
      insertColumns.push('role');
      insertValues.push('Student');
    }
    if (columns.has('department')) {
      insertColumns.push('department');
      insertValues.push(department);
    }
    if (columns.has('email')) {
      insertColumns.push('email');
      insertValues.push(email);
    }
    if (columns.has('password')) {
      insertColumns.push('password');
      insertValues.push(password);
    }

    if (!insertColumns.length) {
      return res.status(500).json({ error: 'Users table schema is invalid' });
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    await db.query(
      `INSERT INTO users (${insertColumns.join(', ')}) VALUES (${placeholders})`,
      insertValues
    );

    res.status(201).json({
      success: true,
      session: {
        user_id: userId,
        name,
        department,
      },
    });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID or email already exists' });
    }
    res.status(500).json({ error: 'Could not register student' });
  }
});

app.get('/api/students/:studentId/profile', async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(
      `SELECT user_id, name, department, role
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [studentId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];
    if (String(student.role || '').toLowerCase() !== 'student') {
      return res.status(403).json({ error: 'User is not a student account' });
    }

    res.json({
      user_id: student.user_id,
      name: student.name,
      department: student.department,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch student profile' });
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