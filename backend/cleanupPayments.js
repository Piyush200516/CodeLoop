require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./models/Payment');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Delete all payments that are stuck in 'created' state
        const result = await Payment.deleteMany({ status: 'created' });
        console.log(`Cleanup complete. Successfully deleted ${result.deletedCount} unpaid payment entries.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanup();
