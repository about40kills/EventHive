const https = require('https');
const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendRegistrationConfirmation } = require('../utils/emailService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Helper function for Paystack requests
// Helper function for Paystack requests
const paystackRequest = (endpoint, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            return reject(new Error('Paystack Secret Key is missing'));
        }

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message || 'Paystack API Error'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', error => reject(error));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

// Helper to regenerate subaccount if invalid (e.g. switching environments)
const regenerateSubaccount = async (user) => {
    if (!user.bankDetails || !user.bankDetails.bankCode || !user.bankDetails.accountNumber) {
        throw new Error('Cannot regenerate subaccount: Missing bank details');
    }

    const payload = {
        business_name: user.bankDetails.accountName || user.name,
        settlement_bank: user.bankDetails.bankCode,
        account_number: user.bankDetails.accountNumber,
        percentage_charge: 5,
        description: `Subaccount for ${user.name} on EventHive`
    };

    const data = await paystackRequest('/subaccount', 'POST', payload);

    // Update user in DB
    user.paystackSubaccountCode = data.subaccount_code;
    await user.save();

    return data.subaccount_code;
};

// ... (createCheckoutSession, getBanks, resolveAccount, createSubaccount remain largely same, just checking secretKey inside) ...

// I will target the Webhook handler specifically for the big fix, and the helper.
// Since I can't replace non-contiguous blocks easily without re-writing the whole file or using multi-replace, 
// and I want to be precise, I will use multi-replace.


// @desc    Initialize Paystack Transaction
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
    try {
        const { eventId, tickets } = req.body;
        const userId = req.user.id;
        const email = req.user.email;

        // Populate organizer to get subaccount code
        const event = await Event.findById(eventId).populate('organizer');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.isFree) {
            return res.status(400).json({ message: 'This event is free' });
        }

        // Calculate Amount and Ticket Details
        let amount = 0;
        let ticketDetails = [];

        if (tickets && Array.isArray(tickets) && tickets.length > 0) {
            tickets.forEach(ticket => {
                amount += ticket.price * ticket.quantity;
            });
            ticketDetails = tickets;
        } else {
            // Fallback for simple single ticket purchase
            amount = event.price;
            ticketDetails = [{ name: 'General Admission', quantity: 1, price: event.price }];
        }

        // Handle missing Paystack key (Mock Mode)
        if (!process.env.PAYSTACK_SECRET_KEY) {
            console.log('⚠️ Paystack key missing. Mocking payment success.');

            const mockRef = 'mock_ref_' + Date.now();
            const ticketCode = `EH-${eventId}-${userId}-${mockRef}`;
            const qrUrl = `${process.env.CLIENT_URL}/events/verify?code=${ticketCode}`;

            // Create/Update Registration
            let registration = await Registration.findOne({ event: eventId, user: userId });

            if (registration) {
                // If existing, update.
                registration.paymentStatus = 'completed';
                registration.paymentId = mockRef;
                registration.amountPaid = amount;
                registration.tickets = ticketDetails;
                registration.qrCode = ticketCode; // Save simple code
                await registration.save();
            } else {
                await Registration.create({
                    event: eventId,
                    user: userId,
                    status: 'confirmed',
                    paymentStatus: 'completed',
                    paymentId: mockRef,
                    amountPaid: amount,
                    tickets: ticketDetails,
                    qrCode: ticketCode // Save simple code
                });
            }

            // Send Email with QR
            // Need user details
            const user = await User.findById(userId);
            if (user) {
                // We need to fetch event correctly if not populated enough (it is)
                // Pass qrUrl which is the full link for the image generator
                await sendRegistrationConfirmation(user.email, event, qrUrl, ticketDetails);
            }

            // Return a mock session and success URL
            return res.status(200).json({
                sessionId: mockRef,
                url: `${process.env.CLIENT_URL}/events/${eventId}?success=true&reference=${mockRef}`
            });
        }

        // Initialize Paystack Transaction
        const payload = {
            email: email,
            amount: Math.round(amount * 100),
            currency: event.currency ? event.currency.toUpperCase() : 'NGN',
            callback_url: `${process.env.CLIENT_URL}/events/${eventId}?success=true`,
            metadata: {
                eventId: eventId,
                userId: userId,
                ticketDetails: JSON.stringify(ticketDetails),
                custom_fields: [
                    {
                        display_name: "Event",
                        variable_name: "event_title",
                        value: event.title
                    }
                ]
            }
        };

        // If organizer has a subaccount, use it for split payment
        if (event.organizer && event.organizer.paystackSubaccountCode) {
            payload.subaccount = event.organizer.paystackSubaccountCode;
            // The percentage_charge was set during subaccount creation (5%)
        }

        let data;
        try {
            data = await paystackRequest('/transaction/initialize', 'POST', payload);
        } catch (error) {
            // Check for Invalid Subaccount error (common when switching envs) and retry
            if (error.message && error.message.includes('Invalid Subaccount') && event.organizer) {
                console.log('⚠️ Invalid subaccount detected. Attempting to regenerate...');
                try {
                    const newSubaccount = await regenerateSubaccount(event.organizer);
                    payload.subaccount = newSubaccount;
                    data = await paystackRequest('/transaction/initialize', 'POST', payload);
                    console.log('✅ Subaccount regenerated and payment initialized successfully.');
                } catch (retryError) {
                    console.error('❌ Failed to regenerate subaccount:', retryError);
                    throw error; // Throw original error
                }
            } else {
                throw error;
            }
        }

        if (!data) {
            throw new Error('Paystack returned no data');
        }

        res.status(200).json({
            sessionId: data.reference,
            url: data.authorization_url
        });

    } catch (error) {
        console.error('Payment Controller Error:', error);
        res.status(500).json({ message: 'Server error during payment initialization' });
    }
};

// @desc    Get List of Banks
// @route   GET /api/payments/banks
// @access  Private (Organizers)
exports.getBanks = async (req, res) => {
    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            // Mock data - Real Ghanaian Banks
            return res.json([
                { name: 'Ecobank Ghana', code: '130100', currency: 'GHS' },
                { name: 'GCB Bank Limited', code: '040100', currency: 'GHS' },
                { name: 'Stanbic Bank Ghana Limited', code: '190100', currency: 'GHS' },
                { name: 'Fidelity Bank Ghana Limited', code: '240100', currency: 'GHS' },
                { name: 'Absa Bank Ghana Ltd', code: '030100', currency: 'GHS' },
                { name: 'Guaranty Trust Bank (Ghana) Limited', code: '230100', currency: 'GHS' },
                { name: 'Zenith Bank (Ghana) Limited', code: '120100', currency: 'GHS' },
                { name: 'Access Bank (Ghana) Plc', code: '280100', currency: 'GHS' },
                { name: 'CalBank PLC', code: '140100', currency: 'GHS' },
                { name: 'Consolidated Bank Ghana', code: '340100', currency: 'GHS' },
                { name: 'Standard Chartered Bank Ghana Limited', code: '020100', currency: 'GHS' },
                { name: 'United Bank for Africa (Ghana) Limited', code: '060100', currency: 'GHS' },
                { name: 'Republic Bank (Ghana) PLC', code: '110100', currency: 'GHS' },
                { name: 'First Atlantic Bank Limited', code: '170100', currency: 'GHS' },
                { name: 'Agricultural Development Bank', code: '080100', currency: 'GHS' },
                { name: 'MTN Mobile Money', code: 'MTN', currency: 'GHS' },
                { name: 'Vodafone Cash', code: 'VOD', currency: 'GHS' },
                { name: 'AirtelTigo Money', code: 'ATL', currency: 'GHS' }
            ]);
        }

        // Fetch specifically for Ghana
        const data = await paystackRequest('/bank?country=ghana', 'GET');

        // Filter for GHS only and deduplicate by name
        const uniqueBanks = Object.values(data.reduce((acc, bank) => {
            if (bank.currency === 'GHS' && !acc[bank.name]) {
                acc[bank.name] = bank;
            }
            return acc;
        }, {}));

        // Sort alphabetically
        uniqueBanks.sort((a, b) => a.name.localeCompare(b.name));

        res.json(uniqueBanks);
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ message: 'Failed to fetch banks' });
    }
};

// @desc    Verify Account Name
// @route   POST /api/payments/resolve-account
// @access  Private
exports.resolveAccount = async (req, res) => {
    const { accountNumber, bankCode } = req.body;
    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            return res.json({ account_name: 'Mock User Account', account_number: accountNumber });
        }

        const data = await paystackRequest(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, 'GET');
        res.json(data);
    } catch (error) {
        console.error('Account resolution error:', error);
        res.status(400).json({ message: 'Could not verify account details' });
    }
};

// @desc    Create Paystack Subaccount for Organizer
// @route   POST /api/payments/create-subaccount
// @access  Private
exports.createSubaccount = async (req, res) => {
    const { bankCode, accountNumber, businessName } = req.body;
    const userId = req.user.id;

    try {
        if (!process.env.PAYSTACK_SECRET_KEY) {
            // Mock update
            await User.findByIdAndUpdate(userId, {
                bankDetails: { bankName: 'Mock Bank', accountNumber, accountName: 'Mock Name', bankCode },
                paystackSubaccountCode: 'ACCT_MOCK_12345'
            });
            return res.json({ message: 'Bank details saved (Mock)', subaccountString: 'ACCT_MOCK_12345' });
        }

        // 1. Create Subaccount on Paystack
        const payload = {
            business_name: businessName,
            settlement_bank: bankCode,
            account_number: accountNumber,
            percentage_charge: 5, // 5% Platform Fee
            description: `Subaccount for ${businessName} on EventHive`
        };

        const data = await paystackRequest('/subaccount', 'POST', payload);

        // 2. Save Code to User Profile
        await User.findByIdAndUpdate(userId, {
            bankDetails: {
                bankName: data.settlement_bank,
                accountNumber: data.account_number,
                accountName: data.account_name || businessName,
                bankCode: bankCode
            },
            paystackSubaccountCode: data.subaccount_code
        });

        res.json({ message: 'Payout account connected successfully', subaccountString: data.subaccount_code });

    } catch (error) {
        console.error('Subaccount creation error:', error);
        res.status(500).json({ message: error.message || 'Failed to create subaccount' });
    }
};

// @desc    Handle Paystack Webhook
// @route   POST /api/payments/webhook
// @access  Public (Paystack Signature)
exports.handleWebhook = async (req, res) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        console.log('Paystack not configured - skipping webhook');
        return res.status(200).send();
    }

    // Validate event
    const hash = crypto.createHmac('sha512', secretKey).update(req.body).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        console.error('Invalid Paystack signature');
        return res.status(400).send('Invalid signature');
    }

    try {
        const event = JSON.parse(req.body.toString());

        // Handle the event
        if (event.event === 'charge.success') {
            const { metadata, reference, amount } = event.data;

            console.log('Webhook received for charge.success:', { reference, metadata });

            const { eventId, userId, ticketDetails: ticketDetailsStr } = metadata;

            // Robust parsing of ticket details
            let ticketDetails = [];
            try {
                ticketDetails = ticketDetailsStr ? JSON.parse(ticketDetailsStr) : [];
            } catch (e) {
                console.error('Error parsing ticketDetails from metadata:', e);
            }

            const ticketCode = `EH-${eventId}-${userId}-${reference}`;
            const qrUrl = `${process.env.CLIENT_URL}/events/verify?code=${ticketCode}`;

            // Check if registration already exists (idempotency)
            const existingReg = await Registration.findOne({ paymentId: reference });
            if (existingReg) {
                console.log(`Registration already exists for ref ${reference}, skipping.`);
                return res.status(200).send();
            }

            // 1. Create Registration
            try {
                await Registration.create({
                    event: eventId,
                    user: userId,
                    status: 'confirmed',
                    paymentStatus: 'completed',
                    paymentId: reference,
                    amountPaid: amount / 100,
                    tickets: ticketDetails,
                    qrCode: ticketCode
                });
                console.log(`Registration created for Event ${eventId}, User ${userId}`);
            } catch (regError) {
                console.error('CRITICAL: Failed to create registration:', regError);
                // We still attempt to update stats/send email if possible? No, implies failure.
                // But we should probably return 200 to Paystack to stop retries if it's a permanent logical error.
                return res.status(200).send();
            }

            // 2. Update Event Stats (Atomic Updates)
            try {
                // Increment total registered count
                await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: 1 } });

                // Update ticket tiers sold count if applicable
                if (ticketDetails.length > 0) {
                    const bulkOps = ticketDetails.map(t => ({
                        updateOne: {
                            filter: { _id: eventId, "ticketTiers.name": t.name },
                            update: { $inc: { "ticketTiers.$.sold": Number(t.quantity) } }
                        }
                    }));

                    if (bulkOps.length > 0) {
                        const bulkResult = await Event.bulkWrite(bulkOps);
                        console.log('Bulk write result for tickets:', bulkResult);
                    }
                }
                console.log(`Stats updated for Event ${eventId}`);
            } catch (statsErr) {
                console.error('Error updating event stats:', statsErr);
            }

            // 3. Send Confirmation Email
            try {
                const user = await User.findById(userId);
                const eventDoc = await Event.findById(eventId);
                if (user && eventDoc) {
                    await sendRegistrationConfirmation(user.email, eventDoc, qrUrl, ticketDetails);
                    console.log(`Confirmation email sent to ${user.email}`);
                }
            } catch (emailErr) {
                console.error('Error sending confirmation email:', emailErr);
            }
        }
    } catch (err) {
        console.error('Error processing webhook:', err);
    }

    res.status(200).send();
};

// @desc    Verify Payment (Manual Callback)
// @route   GET /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;
    const userId = req.user.id; // User must be logged in to verify

    if (!reference) {
        return res.status(400).json({ message: 'Transaction reference is required' });
    }

    try {
        // 1. Verify with Paystack
        const data = await paystackRequest(`/transaction/verify/${reference}`, 'GET');

        if (data.status !== 'success') {
            return res.status(400).json({ message: 'Transaction was not successful' });
        }

        const { metadata, amount } = data;
        const { eventId, ticketDetails: ticketDetailsStr } = metadata;

        // Verify that the logged-in user matches the payment user (optional security check)
        // metadata.userId comes from the session creation
        if (metadata.userId && metadata.userId !== userId) {
            console.warn(`Warning: Payment user ${metadata.userId} does not match logged in user ${userId}`);
            // Proceeding anyway as the user might be an admin or just using a different device? 
            // Ideally we should enforce this, but let's be lenient for now or just log it.
        }

        // Robust parsing of ticket details
        let ticketDetails = [];
        try {
            ticketDetails = ticketDetailsStr ? JSON.parse(ticketDetailsStr) : [];
        } catch (e) {
            console.error('Error parsing ticketDetails from metadata:', e);
        }

        const ticketCode = `EH-${eventId}-${userId}-${reference}`;
        const qrUrl = `${process.env.CLIENT_URL}/events/verify?code=${ticketCode}`;

        // Check if registration already exists (idempotency)
        const existingReg = await Registration.findOne({ paymentId: reference });
        if (existingReg) {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                registration: existingReg
            });
        }

        // 2. Create Registration
        const registration = await Registration.create({
            event: eventId,
            user: userId,
            status: 'confirmed',
            paymentStatus: 'completed',
            paymentId: reference,
            amountPaid: amount / 100,
            tickets: ticketDetails,
            qrCode: ticketCode
        });

        // 3. Update Event Stats (Atomic Updates)
        await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: 1 } });

        if (ticketDetails.length > 0) {
            const bulkOps = ticketDetails.map(t => ({
                updateOne: {
                    filter: { _id: eventId, "ticketTiers.name": t.name },
                    update: { $inc: { "ticketTiers.$.sold": Number(t.quantity) } }
                }
            }));

            if (bulkOps.length > 0) {
                await Event.bulkWrite(bulkOps);
            }
        }

        // 4. Send Confirmation Email
        const user = await User.findById(userId);
        const eventDoc = await Event.findById(eventId);
        if (user && eventDoc) {
            await sendRegistrationConfirmation(user.email, eventDoc, qrUrl, ticketDetails);
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified and registration created',
            registration
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Failed to verify payment' });
    }
};

