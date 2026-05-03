const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
    try {
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';
        const name = 'Test User';

        console.log('--- Testing Registration ---');
        await axios.post(`${API_URL}/auth/register`, { name, email, password });
        console.log('Registration Successful');

        // For verification, I'll need to fetch the OTP from the DB
        console.log('--- Fetching OTP from DB ---');
        const mongoose = require('mongoose');
        const User = require('./models/User');
        const dotenv = require('dotenv');
        dotenv.config();
        
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email });
        const otp = user.otp;
        console.log('OTP found:', otp);

        console.log('--- Testing OTP Verification ---');
        const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
        console.log('Verification Response:', verifyRes.data.message);

        console.log('--- Testing Successful Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        console.log('Login Response: SUCCESS for', loginRes.data.name);

        process.exit(0);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
};

testAuth();
