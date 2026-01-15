const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createCheckoutSession,
    handleWebhook,
    getBanks,
    resolveAccount,
    createSubaccount
} = require('../controllers/paymentController');

// Create checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Onboarding & Payouts
router.get('/banks', protect, getBanks);
router.post('/resolve-account', protect, resolveAccount);
router.post('/create-subaccount', protect, createSubaccount);

// Webhook for Stripe events (no auth middleware, Stripe validates signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
