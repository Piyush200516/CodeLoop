const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));

// Auth middleware
const { protect } = require('./middleware/authMiddleware');

// Uploads static serving
const path = require('path');
app.use('/uploads', require('express').static(path.join(__dirname, 'uploads')));


// Core LeetCode Tracker Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', protect, require('./routes/problemRoutes'));
app.use('/api/dashboard', protect, require('./routes/dashboardRoutes'));
app.use('/api/payments', protect, require('./routes/paymentRoutes'));
app.use('/api/admin', protect, require('./routes/adminRoutes'));


// Health check
app.get('/', (req, res) => res.json({ message: '🚀 CodeRecall LeetCode Tracker API running (MySQL)' }));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

function startServer(ports) {
  const port = ports.shift();
  if (!port) {
    console.error('❌ No available ports (5000-5002)');
    process.exit(1);
  }
  
  console.log(`🚀 Starting server on port ${port}...`);
  const server = app.listen(port, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} in use, trying next...`);
        startServer(ports);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    } else {
      console.log(`✅ Server running on http://localhost:${port}`);
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

const basePort = process.env.PORT || 5000;
startServer([basePort, basePort + 1, basePort + 2]);

