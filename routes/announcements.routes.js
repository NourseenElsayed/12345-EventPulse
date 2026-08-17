const router = require('express').Router();

const {
  requireAuth,
  requireRole
} = require('../middleware/requireAuth');

const {
  createAnnouncement,
  getAnnouncements
} = require('../controllers/announcements.controller');

const validate = require('../middleware/validate');

const {
  createAnnouncementValidation
} = require('../middleware/validationRules');

// Admin-only: create and broadcast announcement
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  createAnnouncementValidation,
  validate,
  createAnnouncement
);

// Public: get announcement history
router.get(
  '/:eventId',
  getAnnouncements
);

module.exports = router;
