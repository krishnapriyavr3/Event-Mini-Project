const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "your", "our",
  "event", "about", "have", "will", "are", "was", "were", "but", "you", "can",
  "all", "any", "not", "too", "very", "has", "had", "its", "their", "them",
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const tokenize = (text) => {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
};

const getTableColumns = async (db, tableName) => {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
};

const getTrainingData = async (db) => {
  const eventColumns = await getTableColumns(db, "events");

  const selectableColumns = ["event_id", "event_name", "type"];
  if (eventColumns.has("expected_attendance")) selectableColumns.push("expected_attendance");
  if (eventColumns.has("budget")) selectableColumns.push("budget");
  if (eventColumns.has("venue_id")) selectableColumns.push("venue_id");
  if (eventColumns.has("description")) selectableColumns.push("description");

  const [events] = await db.query(`SELECT ${selectableColumns.join(", ")} FROM events`);

  let venues = [];
  try {
    const [venueRows] = await db.query("SELECT venue_id, venue_name, location, capacity, type FROM venues");
    venues = venueRows;
  } catch (error) {
    venues = [];
  }

  return { events, venues };
};

const buildModel = (events, venues) => {
  const tokenAttendance = new Map();
  const tokenVenueVotes = new Map();
  const typeAttendance = new Map();
  const venueAttendance = new Map();

  let totalAttendance = 0;
  let attendanceCount = 0;

  for (const event of events) {
    const attendanceRaw = toNumber(event.expected_attendance, 0);
    const budgetBasedFallback = clamp(Math.round(toNumber(event.budget, 0) / 100), 40, 1500);
    const attendance = attendanceRaw > 0 ? attendanceRaw : budgetBasedFallback;

    if (attendance <= 0) continue;

    totalAttendance += attendance;
    attendanceCount += 1;

    const typeKey = String(event.type || "general").toLowerCase();
    if (!typeAttendance.has(typeKey)) typeAttendance.set(typeKey, { sum: 0, count: 0 });
    const typeStats = typeAttendance.get(typeKey);
    typeStats.sum += attendance;
    typeStats.count += 1;

    const text = `${event.event_name || ""} ${event.type || ""} ${event.description || ""}`;
    const tokens = [...new Set(tokenize(text))];

    for (const token of tokens) {
      if (!tokenAttendance.has(token)) tokenAttendance.set(token, { sum: 0, count: 0 });
      const tokenStats = tokenAttendance.get(token);
      tokenStats.sum += attendance;
      tokenStats.count += 1;

      if (event.venue_id) {
        if (!tokenVenueVotes.has(token)) tokenVenueVotes.set(token, new Map());
        const voteMap = tokenVenueVotes.get(token);
        voteMap.set(event.venue_id, (voteMap.get(event.venue_id) || 0) + 1);
      }
    }

    if (event.venue_id) {
      if (!venueAttendance.has(event.venue_id)) venueAttendance.set(event.venue_id, { sum: 0, count: 0 });
      const venueStats = venueAttendance.get(event.venue_id);
      venueStats.sum += attendance;
      venueStats.count += 1;
    }
  }

  const averageAttendance = attendanceCount ? totalAttendance / attendanceCount : 180;

  return {
    averageAttendance,
    tokenAttendance,
    tokenVenueVotes,
    typeAttendance,
    venueAttendance,
    venues,
    trainedOnEvents: attendanceCount,
  };
};

const predictAttendance = (model, input) => {
  const typeKey = String(input.type || "general").toLowerCase();
  const tokens = [...new Set(tokenize(`${input.name || ""} ${input.type || ""} ${input.description || ""}`))];

  let score = model.averageAttendance;
  let confidenceSignals = 1;

  const typeStats = model.typeAttendance.get(typeKey);
  if (typeStats) {
    score = score * 0.55 + (typeStats.sum / typeStats.count) * 0.45;
    confidenceSignals += 1;
  }

  const tokenAverages = tokens
    .map((token) => model.tokenAttendance.get(token))
    .filter(Boolean)
    .map((stats) => stats.sum / stats.count);

  if (tokenAverages.length) {
    const tokenMean = tokenAverages.reduce((sum, value) => sum + value, 0) / tokenAverages.length;
    score = score * 0.65 + tokenMean * 0.35;
    confidenceSignals += Math.min(tokenAverages.length, 3);
  }

  const budget = toNumber(input.budget, 0);
  if (budget > 0) {
    const budgetSignal = clamp(Math.round(budget / 100), 40, 1500);
    score = score * 0.7 + budgetSignal * 0.3;
    confidenceSignals += 1;
  }

  const predictedAttendance = clamp(Math.round(score), 40, 1500);
  const confidence = clamp(Math.round((confidenceSignals / 6) * 100), 45, 98);

  return { predictedAttendance, confidence, tokens };
};

const recommendVenue = (model, tokens, predictedAttendance) => {
  if (!model.venues.length) {
    return {
      venue_id: null,
      venue_name: "Main Auditorium",
      location: "Campus Main",
      capacity: 500,
      type: "Auditorium",
    };
  }

  const weightedVotes = new Map();
  for (const token of tokens) {
    const venueVotes = model.tokenVenueVotes.get(token);
    if (!venueVotes) continue;
    for (const [venueId, voteCount] of venueVotes.entries()) {
      weightedVotes.set(venueId, (weightedVotes.get(venueId) || 0) + voteCount);
    }
  }

  let bestVenue = null;
  let bestScore = -Infinity;

  for (const venue of model.venues) {
    const capacity = toNumber(venue.capacity, 0);
    const capacityGap = capacity - predictedAttendance;
    const fitsEvent = capacityGap >= 0;

    const voteScore = weightedVotes.get(venue.venue_id) || 0;
    const historicalAttendance = model.venueAttendance.get(venue.venue_id);
    const historicalAvg = historicalAttendance
      ? historicalAttendance.sum / historicalAttendance.count
      : predictedAttendance;

    let score = voteScore * 3;
    score += fitsEvent ? 20 : -60;
    score += -Math.abs(predictedAttendance - historicalAvg) / 35;
    score += fitsEvent ? -Math.max(capacityGap, 0) / 120 : 0;

    if (score > bestScore) {
      bestScore = score;
      bestVenue = venue;
    }
  }

  return bestVenue;
};

const trainAndPredictEvent = async (db, input) => {
  const { events, venues } = await getTrainingData(db);
  const model = buildModel(events, venues);
  const { predictedAttendance, confidence, tokens } = predictAttendance(model, input || {});
  const recommendedVenue = recommendVenue(model, tokens, predictedAttendance);

  return {
    predictedAttendance,
    confidence,
    recommendedVenue,
    model: {
      trainedOnEvents: model.trainedOnEvents,
      signalsUsed: tokens.length,
    },
  };
};

module.exports = {
  trainAndPredictEvent,
};
