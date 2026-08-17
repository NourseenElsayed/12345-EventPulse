const Category = require('../models/category.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    count: categories.length,
    data: categories
  });
});

// POST /api/categories
// Admin only
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const existing = await Category.findOne({ name });

  if (existing) {
    return next(new AppError('Category already exists', 400));
  }

  const category = await Category.create({
    name,
    description
  });

  res.status(201).json({
    status: 'success',
    data: category
  });
});
