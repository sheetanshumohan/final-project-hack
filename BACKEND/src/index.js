const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

// Import models
const Input = require('./models/Input');
const Output = require('./models/Output');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS for all routes

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Connect to database
connectDB();

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    message: 'Coastal Early Warning Platform API',
  });
});

// Module 1 routes
const m1Routes = require('./routes/m1');
app.use('/api/m1', m1Routes);

// Module 2 routes
const m2Routes = require('./routes/m2');
app.use('/api/m2', m2Routes);

// Module 4 routes
const m4Routes = require('./routes/m4');
app.use('/api/m4', m4Routes);

// Pipeline routes (runs all modules)
const pipelineRoutes = require('./routes/pipeline');
app.use('/api/pipeline', pipelineRoutes);

// Module 5 - Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Module 5 - Alerts routes
const alertsRoutes = require('./routes/alerts');
app.use('/api/alerts', alertsRoutes);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
