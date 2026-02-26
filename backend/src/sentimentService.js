const POSITIVE_WORDS = [
  "excellent", "amazing", "awesome", "great", "good", "helpful", "smooth", "well",
  "organized", "engaging", "insightful", "informative", "friendly", "interactive", "clear",
  "innovative", "fantastic", "wonderful", "enjoyed", "loved", "best", "impressive", "nice",
  "productive", "valuable", "supportive", "quick", "interesting", "effective", "positive",
];

const NEGATIVE_WORDS = [
  "bad", "poor", "worst", "boring", "confusing", "late", "delay", "crowded", "noisy",
  "disappointing", "unorganized", "unclear", "slow", "hard", "difficult", "issue", "problem",
  "frustrating", "waste", "negative", "boring", "average", "messy", "limited", "insufficient",
  "overcrowded", "tired", "failed", "failure", "missing",
];

const NEGATIONS = new Set(["not", "never", "no", "hardly", "rarely", "without"]);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const analyzeSentiment = (text) => {
  const tokens = tokenize(text);

  if (!tokens.length) {
    return {
      label: "Neutral",
      score: 50,
      positiveHits: [],
      negativeHits: [],
    };
  }

  const positives = new Set(POSITIVE_WORDS);
  const negatives = new Set(NEGATIVE_WORDS);

  let raw = 0;
  const positiveHits = [];
  const negativeHits = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const previous = tokens[index - 1];
    const negated = NEGATIONS.has(previous);

    if (positives.has(token)) {
      raw += negated ? -1 : 1;
      if (negated) {
        negativeHits.push(`not ${token}`);
      } else {
        positiveHits.push(token);
      }
    }

    if (negatives.has(token)) {
      raw += negated ? 1 : -1;
      if (negated) {
        positiveHits.push(`not ${token}`);
      } else {
        negativeHits.push(token);
      }
    }
  }

  const normalized = Math.max(-1, Math.min(1, raw / Math.max(1, tokens.length / 4)));
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

module.exports = {
  analyzeSentiment,
};
