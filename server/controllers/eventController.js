const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const Registration = require('../models/Registration'); 

//configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

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

    // Handle file upload
    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`;
    }

    
    const event = await Event.create(eventData);
    await event.populate('organizer', 'name email');
    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
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
// Update event
//routes PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Parse and convert fields
    const updateData = { ...req.body };

    if (typeof updateData.capacity === 'string') updateData.capacity = parseInt(updateData.capacity, 10);
    if (typeof updateData.isVirtual === 'string') updateData.isVirtual = updateData.isVirtual === 'true';

    if (typeof updateData.accessControl === 'string') {
      try {
        updateData.accessControl = JSON.parse(updateData.accessControl);
        if (typeof updateData.accessControl.isPrivate === 'string') {
          updateData.accessControl.isPrivate = updateData.accessControl.isPrivate === 'true';
        }
      } catch {
        updateData.accessControl = {};
      }
    }

    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
        if (!Array.isArray(updateData.tags)) {
          updateData.tags = updateData.tags ? [updateData.tags] : [];
        }
      } catch {
        updateData.tags = updateData.tags.trim() === '' ? [] : [updateData.tags];
      }
    }

    // Handle image removal 
    if (req.body.removeImage === 'true') {
      updateData.image = null; 
    } 
    // Handle new image upload
    else if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    // Remove the removeImage flag from updateData so it doesn't get saved to DB
    delete updateData.removeImage;

    // Assign all fields to the event
    Object.keys(updateData).forEach(key => {
      event[key] = updateData[key];
    });

    await event.save();
    await event.populate('organizer', 'name email');

    res.json({ success: true, event });
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

// Get event attendees
//routes GET /api/events/:id/attendees
const getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // First, check if the event exists and user is the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Check if the current user is the organizer of this event
    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view attendees for this event' 
      });
    }

    // Fetch attendees (registrations for this event)
    const registrations = await Registration.find({ 
      event: eventId,
      status: { $ne: 'cancelled' } // Exclude cancelled registrations
    })
    .populate('user', 'name email phone avatar')
    .sort({ registrationDate: -1 });

    // Format the attendees data
    const attendees = registrations.map(registration => ({
      _id: registration.user._id,
      name: registration.user.name,
      email: registration.user.email,
      phone: registration.user.phone,
      registrationDate: registration.registrationDate,
      status: registration.status,
      avatar: registration.user.avatar
    }));

    res.json({
      success: true,
      attendees: attendees,
      totalCount: attendees.length
    });
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching attendees' 
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  upload: upload.single('image'),
  getEventAttendees
};