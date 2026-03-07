let RandomForestRegression = null;

try {
  ({ RandomForestRegression } = require("ml-random-forest"));
} catch (error) {
  RandomForestRegression = null;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const hashText = (value, modulo = 1024) => {
  const text = String(value || "").toLowerCase().trim();
  if (!text) return 0;

  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 2147483647;
  }

  return hash % modulo;
};

const wordCount = (value) => {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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

const getAttendanceTarget = (event) => {
  const explicit = toNumber(event.expected_attendance, 0);
  if (explicit > 0) return explicit;

  const fromBudget = clamp(Math.round(toNumber(event.budget, 0) / 100), 40, 1500);
  return fromBudget;
};

const buildFeatures = (event) => {
  const budget = clamp(toNumber(event.budget, 0), 0, 5000000);
  const typeHash = hashText(event.type, 128);
  const nameHash = hashText(event.event_name || event.name, 2048);
  const descHash = hashText(event.description, 4096);
  const descLen = clamp(wordCount(event.description), 0, 400);

  return [budget, typeHash, nameHash, descHash, descLen];
};

const buildFallbackModel = (events, venues) => {
  const venueAttendance = new Map();

  let totalAttendance = 0;
  let attendanceCount = 0;

  for (const event of events) {
    const attendance = getAttendanceTarget(event);
    if (attendance <= 0) continue;

    totalAttendance += attendance;
    attendanceCount += 1;

    if (event.venue_id) {
      if (!venueAttendance.has(event.venue_id)) venueAttendance.set(event.venue_id, { sum: 0, count: 0 });
      const stats = venueAttendance.get(event.venue_id);
      stats.sum += attendance;
      stats.count += 1;
    }
  }

  const averageAttendance = attendanceCount ? totalAttendance / attendanceCount : 180;

  return {
    algorithm: "heuristic-fallback",
    averageAttendance,
    trainedOnEvents: attendanceCount,
    venueAttendance,
    venues,
    predictor: (input) => {
      const baseline = averageAttendance;
      const budgetSignal = clamp(Math.round(toNumber(input.budget, 0) / 100), 40, 1500);
      const hasBudget = toNumber(input.budget, 0) > 0;
      const score = hasBudget ? baseline * 0.7 + budgetSignal * 0.3 : baseline;

      return clamp(Math.round(score), 40, 1500);
    },
  };
};

const buildRandomForestModel = (events, venues) => {
  const venueAttendance = new Map();
  const featureRows = [];
  const targets = [];

  for (const event of events) {
    const target = getAttendanceTarget(event);
    if (target <= 0) continue;

    featureRows.push(buildFeatures(event));
    targets.push(target);

    if (event.venue_id) {
      if (!venueAttendance.has(event.venue_id)) venueAttendance.set(event.venue_id, { sum: 0, count: 0 });
      const stats = venueAttendance.get(event.venue_id);
      stats.sum += target;
      stats.count += 1;
    }
  }

  if (!RandomForestRegression || featureRows.length < 5) {
    return buildFallbackModel(events, venues);
  }

  const rf = new RandomForestRegression({
    nEstimators: 120,
    maxFeatures: 0.6,
    replacement: true,
    noOOB: true,
    seed: 42,
  });

  rf.train(featureRows, targets);

  return {
    algorithm: "random-forest-regression",
    trainedOnEvents: targets.length,
    venueAttendance,
    venues,
    predictor: (input) => {
      const prediction = rf.predict([buildFeatures(input)]);
      const value = Array.isArray(prediction) ? prediction[0] : prediction;
      return clamp(Math.round(toNumber(value, 180)), 40, 1500);
    },
  };
};

const recommendVenue = (model, predictedAttendance) => {
  if (!model.venues.length) {
    return {
      venue_id: null,
      venue_name: "Main Auditorium",
      location: "Campus Main",
      capacity: 500,
      type: "Auditorium",
    };
  }

  let bestVenue = null;
  let bestScore = -Infinity;

  for (const venue of model.venues) {
    const capacity = toNumber(venue.capacity, 0);
    const capacityGap = capacity - predictedAttendance;
    const fitsEvent = capacityGap >= 0;

    const historical = model.venueAttendance.get(venue.venue_id);
    const historicalAvg = historical ? historical.sum / historical.count : predictedAttendance;

    let score = fitsEvent ? 20 : -60;
    score += -Math.abs(predictedAttendance - historicalAvg) / 30;
    score += fitsEvent ? -Math.max(capacityGap, 0) / 110 : 0;

    if (score > bestScore) {
      bestScore = score;
      bestVenue = venue;
    }
  }

  return bestVenue;
};

const getConfidence = (model, input) => {
  const signals = [input?.name, input?.type, input?.description, input?.budget]
    .filter((value) => String(value || "").trim())
    .length;

  const base = model.algorithm === "random-forest-regression" ? 62 : 50;
  const fromTraining = Math.min(22, Math.floor(model.trainedOnEvents / 3));
  const fromSignals = Math.min(12, signals * 3);
  return clamp(base + fromTraining + fromSignals, 45, 96);
};

const roundMetric = (value, digits = 2) => {
  const numeric = toNumber(value, 0);
  const factor = 10 ** digits;
  return Math.round(numeric * factor) / factor;
};

const calculateRegressionMetrics = (actualValues, predictedValues) => {
  const total = actualValues.length;
  if (!total) {
    return {
      mae: 0,
      rmse: 0,
      mape: 0,
      r2: 0,
    };
  }

  let absErrorSum = 0;
  let squaredErrorSum = 0;
  let mapeSum = 0;

  const meanActual = actualValues.reduce((sum, value) => sum + value, 0) / total;
  let totalVariance = 0;

  for (let index = 0; index < total; index += 1) {
    const actual = actualValues[index];
    const predicted = predictedValues[index];
    const error = actual - predicted;

    absErrorSum += Math.abs(error);
    squaredErrorSum += error ** 2;

    if (actual > 0) {
      mapeSum += Math.abs(error) / actual;
    }

    totalVariance += (actual - meanActual) ** 2;
  }

  const mae = absErrorSum / total;
  const rmse = Math.sqrt(squaredErrorSum / total);
  const mape = (mapeSum / total) * 100;
  const r2 = totalVariance > 0 ? 1 - squaredErrorSum / totalVariance : 0;

  return {
    mae: roundMetric(mae),
    rmse: roundMetric(rmse),
    mape: roundMetric(mape),
    r2: roundMetric(r2, 4),
  };
};

const calculateModelMetrics = async (db) => {
  const { events } = await getTrainingData(db);
  const eligibleEvents = events.filter((event) => getAttendanceTarget(event) > 0);

  if (!eligibleEvents.length) {
    return {
      algorithm: "none",
      sampleCount: 0,
      holdoutSize: 0,
      metrics: {
        mae: 0,
        rmse: 0,
        mape: 0,
        r2: 0,
      },
      note: "No events with attendance targets were found",
    };
  }

  const minimumHoldout = eligibleEvents.length >= 8 ? Math.max(1, Math.floor(eligibleEvents.length * 0.2)) : 0;
  const trainingSize = eligibleEvents.length - minimumHoldout;

  const trainingEvents = eligibleEvents.slice(0, Math.max(trainingSize, 1));
  const holdoutEvents = minimumHoldout ? eligibleEvents.slice(trainingSize) : eligibleEvents;

  const model = buildRandomForestModel(trainingEvents, []);

  const actualValues = [];
  const predictedValues = [];

  for (const event of holdoutEvents) {
    const actual = getAttendanceTarget(event);
    const predicted = model.predictor({
      name: event.event_name,
      type: event.type,
      description: event.description,
      budget: event.budget,
    });

    actualValues.push(actual);
    predictedValues.push(predicted);
  }

  return {
    algorithm: model.algorithm,
    sampleCount: eligibleEvents.length,
    holdoutSize: holdoutEvents.length,
    metrics: calculateRegressionMetrics(actualValues, predictedValues),
    note: minimumHoldout
      ? "Metrics are computed on a deterministic holdout split"
      : "Dataset is small; metrics are computed on available samples",
  };
};

const trainAndPredictEvent = async (db, input) => {
  const { events, venues } = await getTrainingData(db);
  const model = buildRandomForestModel(events, venues);

  const predictedAttendance = model.predictor(input || {});
  const confidence = getConfidence(model, input || {});
  const recommendedVenue = recommendVenue(model, predictedAttendance);

  return {
    predictedAttendance,
    confidence,
    recommendedVenue,
    model: {
      trainedOnEvents: model.trainedOnEvents,
      algorithm: model.algorithm,
    },
  };
};

const predictManyEvents = async (db, inputs) => {
  const safeInputs = Array.isArray(inputs) ? inputs : [];
  if (!safeInputs.length) return [];

  const { events, venues } = await getTrainingData(db);
  const model = buildRandomForestModel(events, venues);

  return safeInputs.map((input) => {
    const payload = input || {};
    const predictedAttendance = model.predictor(payload);
    const confidence = getConfidence(model, payload);
    const recommendedVenue = recommendVenue(model, predictedAttendance);

    return {
      predictedAttendance,
      confidence,
      recommendedVenue,
      model: {
        trainedOnEvents: model.trainedOnEvents,
        algorithm: model.algorithm,
      },
    };
  });
};

module.exports = {
  calculateModelMetrics,
  predictManyEvents,
  trainAndPredictEvent,
};
