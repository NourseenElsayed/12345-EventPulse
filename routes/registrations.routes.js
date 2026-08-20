const router = require('express').Router();

const { requireAuth } = require('../middleware/requireAuth');
const ctrl = require('../controllers/registrations.controller');

const validate = require('../middleware/validate');

const {
  createRegistrationValidation
} = require('../middleware/validationRules');

// ===============================
// REGISTER FOR AN EVENT
// ===============================

router.post(
  '/',
  requireAuth,
  createRegistrationValidation,
  validate,
  ctrl.registerForEvent
);

// ===============================
// GET MY REGISTRATIONS
// ===============================

router.get(
  '/my',
  requireAuth,
  ctrl.getMyRegistrations
);

// ===============================
// CANCEL MY REGISTRATION
// ===============================

router.delete(
  '/:id',
  requireAuth,
  ctrl.cancelRegistration
);

module.exports = router;