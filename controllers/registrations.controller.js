const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/registrations
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const eventId = req.body.eventId;

  // Check if event exists
  const event = await Event.findById(eventId);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Check duplicate registration
  const existing = await Registration.findOne({
    event: eventId,
    attendee: userId
  });

  if (existing) {
    return next(
      new AppError('You are already registered for this event', 400)
    );
  }

  // Check event capacity
  const currentCount = await Registration.countDocuments({
    event: eventId
  });

  if (currentCount >= event.capacity) {
    return next(new AppError('This event is full', 400));
  }

  // Create registration
  const registration = await Registration.create({
    event: eventId,
    attendee: userId
  });

  res.status(201).json({
    status: 'success',
    data: registration
  });
});


// GET /api/registrations/my
exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const registrations = await Registration.find({
    attendee: userId
  }).populate('event');

  res.status(200).json({
    status: 'success',
    data: registrations
  });
});


// DELETE /api/registrations/:id
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const registrationId = req.params.id;

  // Check if registration exists
  const registration = await Registration.findById(registrationId);

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  // Check ownership
  if (registration.attendee.toString() !== userId) {
    return next(
      new AppError(
        'You can only cancel your own registration',
        403
      )
    );
  }

  await registration.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Registration cancelled successfully'
  });
});