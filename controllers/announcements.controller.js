const mongoose = require('mongoose');

const Message = require('../models/message.model');
const Event = require('../models/event.model');

// ===============================
// CREATE ANNOUNCEMENT
// POST /api/announcements
// Admin only
// ===============================
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { eventId, text } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event ID'
      });
    }

    // Check that event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Validate text
    if (!text || !text.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Announcement text is required'
      });
    }

    // Save announcement
    const message = await Message.create({
      event: eventId,
      sender: req.user.userId,
      text: text.trim()
    });

    // Populate sender
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    // Get Socket.io instance
    const io = req.app.get('io');

    // Broadcast announcement to event room
    if (io) {
      io.to(eventId.toString()).emit(
        'announcement',
        populatedMessage
      );
    }

    res.status(201).json({
      status: 'success',
      data: populatedMessage
    });

  } catch (error) {
    next(error);
  }
};


// ===============================
// GET ANNOUNCEMENTS
// GET /api/announcements/:eventId
// Public
// ===============================
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid event ID'
      });
    }

    // Get messages from oldest to newest
    const messages = await Message.find({
      event: eventId
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      count: messages.length,
      data: messages
    });

  } catch (error) {
    next(error);
  }
};