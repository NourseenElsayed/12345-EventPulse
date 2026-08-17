const router = require('express').Router();

const {
  register,
  login
} = require('../controllers/authController');

const validate = require('../middleware/validate');

const {
  registerValidation,
  loginValidation
} = require('../middleware/validationRules');

router.post(
  '/register',
  registerValidation,
  validate,
  register
);

router.post(
  '/login',
  loginValidation,
  validate,
  login
);

module.exports = router;
