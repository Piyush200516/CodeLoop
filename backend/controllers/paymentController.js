const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a new order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        
        // Save initial payment record
        await Payment.create({
            userId: req.user._id,
            amount: amount,
            orderId: order.id,
            status: 'created'
        });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order creation failed' });
    }
};

// @desc    Verify payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        try {
            // Update payment record
            const payment = await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: 'paid'
                },
                { new: true } // Return the updated document so we can get its userId
            );

            // ACTUAL FIX: Update the actual User doc's status
             if (payment && payment.userId) {
                await User.findByIdAndUpdate(payment.userId, { isPaid: true, isPremium: true });
            }

            res.json({ message: 'Payment verified successfully', success: true });
        } catch (error) {
            res.status(500).json({ message: 'Payment verification update failed' });
        }
    } else {
        res.status(400).json({ message: 'Invalid signature', success: false });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
