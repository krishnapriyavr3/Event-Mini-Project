let Sentiment = null;

try {
  Sentiment = require("sentiment");
} catch (error) {
  Sentiment = null;
}

const POSITIVE_HINTS = new Set([
  "excellent", "amazing", "awesome", "great", "good", "helpful", "smooth", "organized",
  "engaging", "insightful", "informative", "friendly", "clear", "innovative", "fantastic",
  "wonderful", "enjoyed", "loved", "best", "impressive", "productive", "valuable", "effective",
]);

const NEGATIVE_HINTS = new Set([
  "bad", "poor", "worst", "boring", "confusing", "late", "delay", "crowded", "noisy",
  "disappointing", "unorganized", "unclear", "slow", "hard", "difficult", "issue", "problem",
  "frustrating", "waste", "messy", "limited", "insufficient", "overcrowded", "failed", "missing",
]);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const scoreFromComparative = (comparative) => {
  // Compresses library comparative values into a stable 0-100 score.
  const normalized = Math.tanh(Number(comparative) || 0);
  return Math.round(((normalized + 1) / 2) * 100);
};

const legacyFallback = (tokens) => {
  if (!tokens.length) {
    return { label: "Neutral", score: 50, positiveHits: [], negativeHits: [] };
  }

  let raw = 0;
  const positiveHits = [];
  const negativeHits = [];

  for (const token of tokens) {
    if (POSITIVE_HINTS.has(token)) {
      raw += 1;
      positiveHits.push(token);
    }
    if (NEGATIVE_HINTS.has(token)) {
      raw -= 1;
      negativeHits.push(token);
    }
  }

  const normalized = clamp(raw / Math.max(1, tokens.length / 5), -1, 1);
  const score = Math.round(((normalized + 1) / 2) * 100);

  let label = "Neutral";
  if (score >= 65) label = "Positive";
  if (score <= 40) label = "Negative";

  return {
    label,
    score,
    positiveHits: [...new Set(positiveHits)].slice(0, 4),
    negativeHits: [...new Set(negativeHits)].slice(0, 4),
  };
};

const analyzeSentiment = (text) => {
  const tokens = tokenize(text);

  if (!Sentiment) {
    return {
      ...legacyFallback(tokens),
      engine: "fallback-lexicon",
    };
  }

  if (!tokens.length) {
    return {
      label: "Neutral",
      score: 50,
      positiveHits: [],
      negativeHits: [],
      engine: "sentiment-js",
    };
  }

  const analyzer = new Sentiment();
  const result = analyzer.analyze(tokens.join(" "));
  const score = scoreFromComparative(result.comparative);

  let label = "Neutral";
  if (score >= 65) label = "Positive";
  if (score <= 40) label = "Negative";

  const positiveHits = tokens.filter((token) => POSITIVE_HINTS.has(token));
  const negativeHits = tokens.filter((token) => NEGATIVE_HINTS.has(token));

  return {
    label,
    score,
    positiveHits: [...new Set(positiveHits)].slice(0, 4),
    negativeHits: [...new Set(negativeHits)].slice(0, 4),
    engine: "sentiment-js",
  };
};

module.exports = {
  analyzeSentiment,
};
