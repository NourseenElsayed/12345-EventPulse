```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// =========================
// Create JWT
// =========================
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// =========================
// Bootstrap Admin
// =========================
// Creates the admin account automatically if it does not exist.
// Credentials are taken from Vercel Environment Variables.
const ensureAdminExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();

  let admin = await User.findOne({ email: normalizedEmail }).select(
    '+password'
  );

  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    admin = await User.create({
      name: 'Nourseen',
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin account created successfully:', normalizedEmail);
  }

  return admin;
};

// =========================
// Register
// =========================
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(
      new AppError('Name, email and password are required', 400)
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: 'attendee'
  });

  const token = createToken(user);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// =========================
// Login
// =========================
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Email and password are required', 400)
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Make sure the configured admin exists
  await ensureAdminExists();

  const user = await User.findOne({
    email: normalizedEmail
  }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = createToken(user);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
```
