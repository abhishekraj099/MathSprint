const { db } = require("../config/firebase");
const fallbackQuestions = require("../data/fallbackQuestions");

/**
 * Question Service
 * Business logic for question operations including Firebase and fallback handling
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Filter questions by criteria
 */
const filterQuestions = (questions, topic, tags) => {
  return questions.filter((q) => {
    // Filter by topic if provided
    if (topic && q.topic !== topic) return false;

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      const hasTag = tags.some((tag) => q.tags && q.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Only include active questions
    return q.isActive !== false;
  });
};

/**
 * Fetch questions from Firebase
 * @param {string} level - beginner, intermediate, or advanced
 * @param {string} topic - optional topic filter
 * @param {array} tags - optional tag filters
 * @returns {array} questions from Firebase or null if error/empty
 */
const fetchFromFirebase = async (level, topic, tags) => {
  try {
    // Query Firebase at /questions/{level}
    const snapshot = await db.ref(`questions/${level}`).once("value");
    
    if (!snapshot.exists()) {
      console.log(`No questions found in Firebase for level: ${level}`);
      return null;
    }

    // Convert snapshot to array
    const data = snapshot.val();
    const questions = Object.values(data).map((q) => ({
      ...q,
      isActive: q.isActive !== false, // Default to true if not specified
    }));

    // Filter by topic and tags
    const filtered = filterQuestions(questions, topic, tags);
    return filtered.length > 0 ? filtered : null;
  } catch (error) {
    console.error(`Firebase fetch error for level ${level}:`, error.message);
    return null; // Return null to trigger fallback
  }
};

/**
 * Fetch questions from local fallback data
 * @param {string} level - beginner, intermediate, or advanced
 * @param {string} topic - optional topic filter
 * @param {array} tags - optional tag filters
 * @returns {array} questions from fallback data
 */
const fetchFallback = (level, topic, tags) => {
  const levelQuestions = fallbackQuestions[level] || [];
  const filtered = filterQuestions(levelQuestions, topic, tags);
  return filtered;
};

/**
 * Get questions with Firebase first, fallback to local data
 * @param {string} level - beginner, intermediate, or advanced
 * @param {string} topic - optional topic filter
 * @param {string} tagsString - optional comma-separated tag string
 * @param {number} limit - max number of questions to return
 * @returns {object} { questions, source, count }
 */
const getQuestionsWithFallback = async (level, topic, tagsString, limit) => {
  // Parse tags from comma-separated string
  const tags = tagsString
    ? tagsString.split(",").map((t) => t.trim()).filter((t) => t)
    : [];

  // Try Firebase first
  let questions = await fetchFromFirebase(level, topic, tags);
  let source = "firebase";

  // Fall back to local data if Firebase fails or returns empty
  if (!questions || questions.length === 0) {
    questions = fetchFallback(level, topic, tags);
    source = "fallback";
  }

  // Shuffle questions for randomization
  questions = shuffleArray(questions);

  // Apply limit
  questions = questions.slice(0, limit);

  return {
    questions,
    source,
    count: questions.length,
  };
};

/**
 * Get all unique topics for a level
 * @param {string} level - beginner, intermediate, or advanced
 * @returns {array} array of topics
 */
const getTopicsForLevel = async (level) => {
  try {
    // Try Firebase first
    const snapshot = await db.ref(`questions/${level}`).once("value");

    if (snapshot.exists()) {
      const data = snapshot.val();
      const questions = Object.values(data).filter((q) => q.isActive !== false);
      const topics = [...new Set(questions.map((q) => q.topic))].sort();
      return { topics, source: "firebase" };
    }
  } catch (error) {
    console.error(`Firebase topics fetch error for level ${level}:`, error.message);
  }

  // Fallback to local data
  const levelQuestions = fallbackQuestions[level] || [];
  const activeQuestions = levelQuestions.filter((q) => q.isActive !== false);
  const topics = [...new Set(activeQuestions.map((q) => q.topic))].sort();
  return { topics, source: "fallback" };
};

/**
 * Add a new question to Firebase
 * @param {object} questionData - question details
 * @param {string} level - beginner, intermediate, or advanced
 * @returns {object} created question with ID
 */
const addQuestion = async (questionData, level) => {
  try {
    const { v4: uuidv4 } = require("uuid");
    const questionId = uuidv4();
    const timestamp = Date.now();

    const newQuestion = {
      id: questionId,
      ...questionData,
      level, // Ensure level is included
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to Firebase
    await db.ref(`questions/${level}/${questionId}`).set(newQuestion);

    return newQuestion;
  } catch (error) {
    throw new Error(`Failed to add question: ${error.message}`);
  }
};

/**
 * Update an existing question in Firebase
 * @param {string} questionId - question ID
 * @param {string} level - beginner, intermediate, or advanced
 * @param {object} updateData - partial question data to update
 * @returns {object} updated question
 */
const updateQuestion = async (questionId, level, updateData) => {
  try {
    const timestamp = Date.now();

    const updates = {
      ...updateData,
      updatedAt: timestamp,
    };

    // Update in Firebase
    await db.ref(`questions/${level}/${questionId}`).update(updates);

    // Fetch and return the updated question
    const snapshot = await db.ref(`questions/${level}/${questionId}`).once("value");
    if (!snapshot.exists()) {
      throw new Error("Question not found after update");
    }

    return snapshot.val();
  } catch (error) {
    throw new Error(`Failed to update question: ${error.message}`);
  }
};

/**
 * Soft delete a question (set isActive to false)
 * @param {string} questionId - question ID
 * @param {string} level - beginner, intermediate, or advanced
 * @returns {boolean} success
 */
const softDeleteQuestion = async (questionId, level) => {
  try {
    const timestamp = Date.now();

    await db.ref(`questions/${level}/${questionId}`).update({
      isActive: false,
      updatedAt: timestamp,
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete question: ${error.message}`);
  }
};

/**
 * Get question by ID
 * @param {string} questionId - question ID
 * @param {string} level - beginner, intermediate, or advanced
 * @returns {object} question or null
 */
const getQuestionById = async (questionId, level) => {
  try {
    const snapshot = await db.ref(`questions/${level}/${questionId}`).once("value");
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(`Error fetching question: ${error.message}`);
    return null;
  }
};

module.exports = {
  getQuestionsWithFallback,
  getTopicsForLevel,
  addQuestion,
  updateQuestion,
  softDeleteQuestion,
  getQuestionById,
  shuffleArray,
  filterQuestions,
  fetchFromFirebase,
  fetchFallback,
};
