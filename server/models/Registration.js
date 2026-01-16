const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'waitlist'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'free'],
    default: 'free'
  },
  paymentId: {
    type: String
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  tickets: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  checkedInCount: {
    type: Number,
    default: 0
  }
});

// Remove unique index to allow multiple orders per user/event
// registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ user: 1, event: 1 });

module.exports = mongoose.model('Registration', registrationSchema);