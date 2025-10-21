const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { sendRegistrationConfirmation } = require('../utils/emailService');

// Register for event
//routes POST /api/registrations
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params; 
    const { accessCode } = req.body;

    // Check if event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      user: req.user._id, 
      event: eventId 
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check private event access
    if (event.accessControl.isPrivate) {
      if (accessCode && accessCode !== event.accessControl.accessCode) {
        return res.status(403).json({ message: 'Invalid access code' });
      }

      // Check email domain if allowed domains are specified
      if (event.accessControl.allowedDomains.length > 0) { 
        const userDomain = req.user.email.split('@')[1];
        if (!event.accessControl.allowedDomains.includes(userDomain)) { 
          return res.status(403).json({ message: 'Email domain not allowed for this event' }); 
        }
      }
    }

    // Check capacity
    let registrationStatus = 'confirmed';
    if (event.registeredCount >= event.capacity) { 
      registrationStatus = 'waitlist'; 
    }

    // Create registration
    const registration = await Registration.create({
      user: req.user._id, 
      event: eventId,  
      status: registrationStatus 
    });

    // Increment registered count only if confirmed
    if (registrationStatus === 'confirmed') {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registeredCount: 1 }
      });
    }

    // Send confirmation email
    try {
      await sendRegistrationConfirmation(req.user.email, event);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: registrationStatus === 'confirmed' 
        ? 'Successfully registered for event' 
        : 'Added to waitlist',
      registration
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel registration
//routes DELETE /api/registrations/:eventId
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Store the original status before deletion
    const wasConfirmed = registration.status === 'confirmed';

    // Delete the registration
    await Registration.deleteOne({ _id: registration._id });

    // Decrement registered count if it was confirmed
    if (wasConfirmed) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { registeredCount: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's registrations
//routes GET /api/registrations/my-registrations
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: 'confirmed'
    }).populate('event');

    // Filter out registrations where event was deleted (null)
    const validRegistrations = registrations.filter(reg => reg.event !== null);

    res.json({
      success: true,
      registrations: validRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event attendees (organizer only)
//routes GET /api/registrations/event-attendees/:eventId
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists and user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view attendees' });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: 'confirmed' 
    }).populate('user', 'name email'); 

    const attendees = registrations.map(reg => ({ 
      name: reg.user.name,
      email: reg.user.email, 
      registrationDate: reg.registrationDate
    }));

    res.json({
      success: true,
      attendees,
      totalCount: attendees.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees
};