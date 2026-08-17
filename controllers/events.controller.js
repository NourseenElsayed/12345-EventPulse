const mongoose = require('mongoose');

const Event = require('../models/event.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');

// ===============================
// GET ALL EVENTS
// GET /api/events
// ===============================
exports.getEvents = async (req, res, next) => {
  try {
    const {
      category,
      city,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      order,
      search
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter.city = city;
    }

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // ===============================
    // TEXT SEARCH
    // ===============================

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          description: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    // ===============================
    // PAGINATION
    // ===============================

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);

    const skip = (pageNum - 1) * limitNum;

    // ===============================
    // SORTING
    // ===============================

    const allowedSortFields = [
      'date',
      'registrations'
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'date';

    const sortDirection = order === 'desc' ? -1 : 1;

    const sort = {
      [sortField]: sortDirection
    };

    // ===============================
    // DATABASE QUERY
    // ===============================

    const [data, total] = await Promise.all([
      Event.find(filter)
        .populate('category')
        .populate('organizer')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),

      Event.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      status: 'success',
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      data
    });

  } catch (error) {
    next(error);
  }
};


// ===============================
// GET SINGLE EVENT
// GET /api/events/:id
// ===============================
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findById(id)
      .populate('category')
      .populate('organizer');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: event
    });

  } catch (error) {
    next(error);
  }
};


// ===============================
// ===============================
// CREATE EVENT
// POST /api/events
// ===============================
exports.createEvent = async (req, res, next) => {
  try {
    // Get an admin user from the database
    const organizer = await User.findOne({ role: 'admin' });

    if (!organizer) {
      return res.status(400).json({
        status: 'error',
        message: 'No admin user found'
      });
    }

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      city: req.body.city,
      venue: req.body.venue,
      capacity: req.body.capacity,
      organizer: organizer._id
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('category')
      .populate('organizer');

    res.status(201).json({
      status: 'success',
      data: populatedEvent
    });

  } catch (error) {
    next(error);
  }
};

// ===============================
// UPDATE EVENT
// PATCH /api/events/:id
// ===============================
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('category')
      .populate('organizer');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: event
    });

  } catch (error) {
    next(error);
  }
};


// ===============================
// DELETE EVENT
// DELETE /api/events/:id
// ===============================
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event ID'
      });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};