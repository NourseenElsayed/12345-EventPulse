const { body, param } = require('express-validator');

// ===============================
// AUTH VALIDATION
// ===============================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// ===============================
// EVENT VALIDATION
// ===============================

const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('category')
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ID'),

  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),

  body('capacity')
    .isFloat({ min: 1 })
    .withMessage('Capacity must be a positive number')
];

const updateEventValidation = [
  param('id')
    .isMongoId()
    .withMessage('Event ID must be a valid MongoDB ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ID'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),

  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Venue cannot be empty'),

  body('capacity')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Capacity must be a positive number')
];

// ===============================
// REGISTRATION VALIDATION
// ===============================

const createRegistrationValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('Event ID must be a valid MongoDB ID')
];

// ===============================
// ANNOUNCEMENT VALIDATION
// ===============================

const createAnnouncementValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('Event ID must be a valid MongoDB ID'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Announcement text is required')
];

module.exports = {
  registerValidation,
  loginValidation,
  createEventValidation,
  updateEventValidation,
  createRegistrationValidation,
  createAnnouncementValidation
};
