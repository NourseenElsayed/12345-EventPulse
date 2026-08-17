const router = require('express').Router();

const {
  requireAuth,
  requireRole
} = require('../middleware/requireAuth');

const {
  getCategories,
  createCategory
} = require('../controllers/categories.controller');

const validate = require('../middleware/validate');
const { body } = require('express-validator');

// Public
router.get('/', getCategories);

// Admin only
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),

    body('description')
      .optional()
      .trim()
  ],
  validate,
  createCategory
);

module.exports = router;
