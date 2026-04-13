const Joi = require("joi");

/**
 * Question Validators using Joi
 * Validates all API endpoint inputs
 */

// Validation schemas
const schemas = {
  // GET /api/questions query validation
  getQuestions: Joi.object({
    level: Joi.string()
      .required()
      .valid("beginner", "intermediate", "advanced")
      .messages({
        "string.base": "Level must be a string",
        "any.required": "Level is required",
        "any.only": 'Level must be one of: beginner, intermediate, advanced',
      }),
    topic: Joi.string()
      .optional()
      .trim()
      .max(50)
      .messages({
        "string.max": "Topic cannot exceed 50 characters",
      }),
    tags: Joi.string()
      .optional()
      .trim()
      .messages({
        "string.base": "Tags must be a string (comma-separated)",
      }),
    limit: Joi.number()
      .optional()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        "number.base": "Limit must be a number",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 50",
      }),
  }).unknown(false),

  // GET /api/questions/topics query validation
  getTopics: Joi.object({
    level: Joi.string()
      .required()
      .valid("beginner", "intermediate", "advanced")
      .messages({
        "string.base": "Level must be a string",
        "any.required": "Level is required",
        "any.only": "Level must be one of: beginner, intermediate, advanced",
      }),
  }).unknown(false),

  // POST /api/questions body validation (create new question)
  createQuestion: Joi.object({
    questionText: Joi.string()
      .required()
      .trim()
      .min(10)
      .max(500)
      .messages({
        "string.base": "Question text must be a string",
        "any.required": "Question text is required",
        "string.min": "Question text must be at least 10 characters",
        "string.max": "Question text cannot exceed 500 characters",
      }),
    options: Joi.array()
      .required()
      .items(Joi.string().trim().max(200))
      .min(2)
      .max(6)
      .messages({
        "array.base": "Options must be an array",
        "any.required": "Options are required",
        "array.min": "At least 2 options required",
        "array.max": "Maximum 6 options allowed",
      }),
    correctAnswer: Joi.string()
      .required()
      .trim()
      .messages({
        "string.base": "Correct answer must be a string",
        "any.required": "Correct answer is required",
      }),
    explanation: Joi.string()
      .optional()
      .trim()
      .max(500),
    level: Joi.string()
      .required()
      .valid("beginner", "intermediate", "advanced")
      .messages({
        "any.required": "Level is required",
        "any.only": "Level must be one of: beginner, intermediate, advanced",
      }),
    topic: Joi.string()
      .required()
      .trim()
      .max(50)
      .messages({
        "any.required": "Topic is required",
      }),
    difficulty: Joi.number()
      .required()
      .integer()
      .min(1)
      .max(5)
      .messages({
        "number.base": "Difficulty must be a number",
        "any.required": "Difficulty is required",
        "number.min": "Difficulty must be between 1 and 5",
        "number.max": "Difficulty must be between 1 and 5",
      }),
    points: Joi.number()
      .required()
      .integer()
      .min(1)
      .max(100)
      .messages({
        "number.base": "Points must be a number",
        "any.required": "Points is required",
        "number.min": "Points must be at least 1",
      }),
    timeLimit: Joi.number()
      .required()
      .integer()
      .min(5)
      .max(300)
      .messages({
        "number.base": "Time limit must be a number (in seconds)",
        "any.required": "Time limit is required",
        "number.min": "Time limit must be at least 5 seconds",
      }),
    tags: Joi.array()
      .optional()
      .items(Joi.string().trim())
      .max(10),
  }).unknown(false),

  // PUT /api/questions/:id body validation (update question - all fields optional)
  updateQuestion: Joi.object({
    questionText: Joi.string()
      .optional()
      .trim()
      .min(10)
      .max(500),
    options: Joi.array()
      .optional()
      .items(Joi.string().trim().max(200))
      .min(2)
      .max(6),
    correctAnswer: Joi.string()
      .optional()
      .trim(),
    explanation: Joi.string()
      .optional()
      .trim()
      .max(500),
    topic: Joi.string()
      .optional()
      .trim()
      .max(50),
    difficulty: Joi.number()
      .optional()
      .integer()
      .min(1)
      .max(5),
    points: Joi.number()
      .optional()
      .integer()
      .min(1)
      .max(100),
    timeLimit: Joi.number()
      .optional()
      .integer()
      .min(5)
      .max(300),
    tags: Joi.array()
      .optional()
      .items(Joi.string().trim())
      .max(10),
    isActive: Joi.boolean()
      .optional(),
  }).unknown(false),

  // DELETE /api/questions/:id body validation (only)
  deleteQuestionBody: Joi.object({
    level: Joi.string()
      .required()
      .valid("beginner", "intermediate", "advanced")
      .messages({
        "any.required": "Level is required",
        "any.only": "Level must be one of: beginner, intermediate, advanced",
      }),
  }).unknown(false),
};

/**
 * Middleware factories for request validation
 */

const validateQueryParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const err = new Error(error.details.map((d) => d.message).join(", "));
    err.isJoi = true;
    err.details = error.details;
    return next(err);
  }

  req.query = value;
  next();
};

const validateBodyParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const err = new Error(error.details.map((d) => d.message).join(", "));
    err.isJoi = true;
    err.details = error.details;
    return next(err);
  }

  req.body = value;
  next();
};

const validatePathParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const err = new Error(error.details.map((d) => d.message).join(", "));
    err.isJoi = true;
    err.details = error.details;
    return next(err);
  }

  req.params = value;
  next();
};

module.exports = {
  schemas,
  validateQueryParams,
  validateBodyParams,
  validatePathParams,
};
