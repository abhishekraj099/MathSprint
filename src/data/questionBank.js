const topics = {
  algebra1: { label: "Algebra 1", icon: "📐", level: "beginner" },
  geometry: { label: "Geometry", icon: "📦", level: "beginner" },
  fractions: { label: "Fractions", icon: "🔀", level: "beginner" },
  decimals: { label: "Decimals", icon: "💯", level: "intermediate" },
  percentages: { label: "Percentages", icon: "%", level: "intermediate" },
  algebra2: { label: "Algebra 2", icon: "📈", level: "intermediate" },
  trigonometry: { label: "Trigonometry", icon: "🔺", level: "advanced" },
  calculus: { label: "Calculus", icon: "∫", level: "advanced" },
};

const levelTopics = {
  beginner: ["algebra1", "geometry", "fractions"],
  intermediate: ["decimals", "percentages", "algebra2"],
  advanced: ["trigonometry", "calculus"],
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateQuestion(topicId, difficulty) {
  const topic = topics[topicId];
  if (!topic) {
    throw new Error(`Invalid topicId: ${topicId}`);
  }
  
  const questionTemplates = {
    algebra1: [
      { text: "Solve: 2x + 5 = 13", answer: 4 },
      { text: "Solve: 3x - 7 = 2", answer: 3 },
      { text: "Solve: x/2 = 10", answer: 20 },
    ],
    geometry: [
      { text: "Area of rectangle with length 5 and width 3?", answer: 15 },
      { text: "Perimeter of square with side 4?", answer: 16 },
    ],
    fractions: [
      { text: "1/2 + 1/3 = ?", answer: "5/6" },
      { text: "2/3 - 1/3 = ?", answer: "1/3" },
    ],
    decimals: [
      { text: "0.5 + 0.25 = ?", answer: 0.75 },
      { text: "1.5 × 2 = ?", answer: 3 },
    ],
    percentages: [
      { text: "25% of 100 = ?", answer: 25 },
      { text: "50% of 80 = ?", answer: 40 },
    ],
    algebra2: [
      { text: "Solve: x² - 5x + 6 = 0", answer: "x = 2 or 3" },
      { text: "Expand: (x+2)(x-3)", answer: "x² - x - 6" },
    ],
    trigonometry: [
      { text: "sin(90°) = ?", answer: 1 },
      { text: "cos(0°) = ?", answer: 1 },
    ],
    calculus: [
      { text: "Derivative of x² = ?", answer: "2x" },
      { text: "Integral of 2x = ?", answer: "x²" },
    ],
  };

  const questions = questionTemplates[topicId] || [];
  if (questions.length === 0) {
    throw new Error(`No questions found for topic: ${topicId}`);
  }
  
  const q = questions[Math.floor(Math.random() * questions.length)];
  if (!q) {
    throw new Error(`Failed to select question for topic: ${topicId}`);
  }
  
  return {
    id: generateUUID(),
    topic: topicId,
    question: q.text,
    answer: q.answer,
    difficulty,
    createdAt: new Date().toISOString(),
  };
}

function generateQuestionsForLevel(level, perTopic = 8) {
  if (!levelTopics[level]) {
    throw new Error(`Invalid level: ${level}`);
  }

  if (!Number.isInteger(perTopic) || perTopic < 1 || perTopic > 20) {
    throw new Error(`Invalid perTopic: must be between 1 and 20`);
  }

  const topicIds = levelTopics[level] || [];
  const questions = [];

  try {
    topicIds.forEach(topicId => {
      for (let i = 0; i < perTopic; i++) {
        questions.push(generateQuestion(topicId, level));
      }
    });
  } catch (err) {
    console.error("Question generation error:", err.message);
    throw err;
  }

  if (questions.length === 0) {
    throw new Error("No questions generated");
  }

  return questions;
}

module.exports = {
  topics,
  levelTopics,
  generateQuestionsForLevel,
  generateQuestion,
};