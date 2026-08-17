const router = require('express').Router();

const {
  requireAuth,
  requireRole
} = require('../middleware/requireAuth');

const ctrl = require('../controllers/events.controller');

const validate = require('../middleware/validate');

const {
  createEventValidation,
  updateEventValidation
} = require('../middleware/validationRules');


// ===============================
// PUBLIC ROUTES
// ===============================

router.get('/', ctrl.getEvents);

router.get('/:id', ctrl.getEventById);


// ===============================
// ADMIN-ONLY ROUTES
// ===============================

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  createEventValidation,
  validate,
  ctrl.createEvent
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  updateEventValidation,
  validate,
  ctrl.updateEvent
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  ctrl.deleteEvent
);


module.exports = router;