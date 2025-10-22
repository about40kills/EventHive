const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  upload
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, upload, createEvent); 
router.put('/:id', protect, upload, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.get('/my-events', protect, getMyEvents);

// Public routes (but can use auth middleware for additional features)
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getAllEvents);

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getEventById);



module.exports = router;