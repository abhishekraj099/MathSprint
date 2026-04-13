const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const requireAdmin = require("../middleware/requireAdmin");
const questionController = require("../controllers/questionController");
const {
  schemas,
  validateQueryParams,
  validateBodyParams,
  validatePathParams,
} = require("../validators/questionValidator");

// Public routes - require authentication only

/**
 * GET /api/questions
 * Fetch questions based on level, topic, tags, limit
 * Query params: level (required), topic (optional), tags (optional), limit (optional, default 10, max 50)
 */
router.get(
  "/",
  verifyToken,
  validateQueryParams(schemas.getQuestions),
  questionController.getQuestions
);

/**
 * GET /api/questions/topics
 * Get available topics for a specific level
 * Query params: level (required)
 */
router.get(
  "/topics",
  verifyToken,
  validateQueryParams(schemas.getTopics),
  questionController.getTopics
);

// Admin routes - require authentication + admin role

/**
 * POST /api/questions
 * Create a new question (Admin only)
 * Body: questionText, options, correctAnswer, explanation, level, topic, difficulty, points, timeLimit, tags
 */
router.post(
  "/",
  verifyToken,
  requireAdmin,
  validateBodyParams(schemas.createQuestion),
  questionController.addQuestion
);

/**
 * PUT /api/questions/:id
 * Update an existing question (Admin only)
 * Params: id (question ID)
 * Body: partial question fields to update + level (required)
 */
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validatePathParams(schemas.deleteQuestion),
  validateBodyParams(schemas.updateQuestion),
  questionController.updateQuestion
);

/**
 * DELETE /api/questions/:id
 * Soft delete a question (Admin only)
 * Params: id (question ID)
 * Body: level (required)
 */
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateBodyParams(schemas.deleteQuestionBody),
  questionController.deleteQuestion
);

module.exports = router;