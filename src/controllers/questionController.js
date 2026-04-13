const questionService = require("../services/questionService");

/**
 * Question Controller
 * Handles all question-related API requests
 */

/**
 * GET /api/questions
 * Fetch questions based on level, topic, tags, limit
 */
const getQuestions = async (req, res, next) => {
  try {
    const { level, topic, tags, limit = 10 } = req.query;

    // Get questions with fallback
    const result = await questionService.getQuestionsWithFallback(
      level,
      topic,
      tags,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      source: result.source,
      count: result.count,
      questions: result.questions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/questions/topics
 * Get available topics for a specific level
 */
const getTopics = async (req, res, next) => {
  try {
    const { level } = req.query;

    const result = await questionService.getTopicsForLevel(level);

    // Format topics array with labels
    const formattedTopics = result.topics.map((topic) => ({
      id: topic,
      label: topic.charAt(0).toUpperCase() + topic.slice(1), // Capitalize first letter
    }));

    res.status(200).json({
      success: true,
      level,
      source: result.source,
      count: formattedTopics.length,
      topics: formattedTopics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/questions
 * Add a new question (Admin only)
 */
const addQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      explanation,
      level,
      topic,
      difficulty,
      points,
      timeLimit,
      tags,
    } = req.body;

    // Validate that correctAnswer is one of the options
    if (!options.includes(correctAnswer)) {
      const error = new Error("correctAnswer must be one of the provided options");
      error.status = 400;
      return next(error);
    }

    // Create question object
    const questionData = {
      questionText,
      options,
      correctAnswer,
      explanation: explanation || "",
      topic,
      difficulty,
      points,
      timeLimit,
      tags: tags || [],
    };

    // Add to Firebase
    const newQuestion = await questionService.addQuestion(questionData, level);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/questions/:id
 * Update an existing question (Admin only)
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { level, ...updateData } = req.body;

    if (!level) {
      const error = new Error("Level must be provided in request body");
      error.status = 400;
      return next(error);
    }

    // Validate correctAnswer if it's being updated
    if (updateData.correctAnswer) {
      if (
        updateData.options &&
        !updateData.options.includes(updateData.correctAnswer)
      ) {
        const error = new Error("correctAnswer must be one of the provided options");
        error.status = 400;
        return next(error);
      }
    }

    // Get current question to check if it exists
    const currentQuestion = await questionService.getQuestionById(id, level);
    if (!currentQuestion) {
      const error = new Error("Question not found");
      error.status = 404;
      return next(error);
    }

    // Update the question
    const updatedQuestion = await questionService.updateQuestion(id, level, updateData);

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: updatedQuestion,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/questions/:id
 * Soft delete a question (Admin only)
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { level } = req.body;

    if (!level) {
      const error = new Error("Level must be provided in request body");
      error.status = 400;
      return next(error);
    }

    // Get question to check if it exists
    const question = await questionService.getQuestionById(id, level);
    if (!question) {
      const error = new Error("Question not found");
      error.status = 404;
      return next(error);
    }

    // Soft delete the question
    await questionService.softDeleteQuestion(id, level);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      questionId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getTopics,
  addQuestion,
  updateQuestion,
  deleteQuestion,
};
