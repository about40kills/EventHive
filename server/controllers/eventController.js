const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Create event
//routes POST /api/events
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id // only the organizer is authenticated user for events
    };

    // Validate Base64 image if provided
    if (eventData.image) {
      if (!eventData.image.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image format. Must be a Base64 encoded image.' });
      }
    }

    const event = await Event.create(eventData);
    await event.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events
//routes GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const { search, category, eventType, status, upcoming } = req.query;
    let query = {};

    // Build query
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (eventType) {
      query.eventType = eventType;
    }
    if (status) {
      query.status = status;
    }

    // Filter for upcoming events only
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    // Filter out private events unless user is authenticated
    if (!req.user) {
      query['accessControl.isPrivate'] = { $ne: true };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
//routes GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if private event
    if (event.accessControl.isPrivate && !req.user) {
      return res.status(401).json({ message: 'Access denied to private event' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event
//routes PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };

    // Validate Base64 image if provided
    if (updateData.image && !updateData.image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Must be a Base64 encoded image.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event
//routes DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get organizer's events
//routes GET /api/events/my-events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents
};