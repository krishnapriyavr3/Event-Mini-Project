const db = require("../db");

const ensureEventExists = async (eventId) => {
  const [eventRows] = await db.query("SELECT event_id FROM events WHERE event_id = ? LIMIT 1", [eventId]);
  if (eventRows.length) return eventId;

  await db.query(
    `INSERT INTO events (event_id, event_name, type, date, location, description, budget, status)
     VALUES (?, ?, ?, CURDATE(), ?, ?, ?, 'Planned')`,
    [eventId, "Demo AI Event", "Technical", "Campus Main", "Demo seeded event", 10000]
  );
  return eventId;
};

const seedFeedback = async () => {
  const eventId = await ensureEventExists("E990");

  const [columnRows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feedback'`
  );
  const columns = new Set(columnRows.map((row) => row.COLUMN_NAME));
  const commentColumn = columns.has("comments") ? "comments" : columns.has("comment") ? "comment" : null;

  const samples = [
    { rating: 5, text: "Excellent event and very informative", label: "Positive", score: 0.95 },
    { rating: 4, text: "Good organization and smooth flow", label: "Positive", score: 0.82 },
    { rating: 3, text: "Average overall experience", label: "Neutral", score: 0.5 },
    { rating: 2, text: "Confusing sessions and delayed start", label: "Negative", score: 0.2 },
  ];

  for (const sample of samples) {
    const insertColumns = [];
    const insertValues = [];

    if (columns.has("user_id")) {
      insertColumns.push("user_id");
      insertValues.push("U001");
    }

    if (columns.has("event_id")) {
      insertColumns.push("event_id");
      insertValues.push(eventId);
    }

    if (columns.has("rating")) {
      insertColumns.push("rating");
      insertValues.push(sample.rating);
    }

    if (commentColumn) {
      insertColumns.push(commentColumn);
      insertValues.push(sample.text);
    }

    if (columns.has("sentiment_label")) {
      insertColumns.push("sentiment_label");
      insertValues.push(sample.label);
    }

    if (columns.has("sentiment_score")) {
      insertColumns.push("sentiment_score");
      insertValues.push(sample.score);
    }

    const placeholders = insertColumns.map(() => "?").join(", ");
    await db.query(
      `INSERT INTO feedback (${insertColumns.join(", ")}) VALUES (${placeholders})`,
      insertValues
    );
  }
};

(async () => {
  try {
    await seedFeedback();
    console.log("✅ Demo seed completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Demo seed failed:", error.message);
    process.exit(1);
  }
})();
