const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initState, connectMongoDB } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database State and connect to MongoDB Atlas
initState();
connectMongoDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'S.A.F.A.R. - Smart Tourist Safety System Backend',
    framework: 'Smart AI Framework for Assured & Responsible Tourism',
    ministry: 'Ministry of Tourism, Govt. of India',
    timestamp: new Date().toISOString()
  });
});

// Register Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tourists', require('./routes/touristRoutes'));
app.use('/api/digital-id', require('./routes/digitalIdRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/geofences', require('./routes/geoFenceRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/demo', require('./routes/demoRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/privacy', require('./routes/privacyRoutes'));
app.use('/api/mesh-rescue', require('./routes/meshRescueRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/deadman', require('./routes/deadmanRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` S.A.F.A.R. API Server Running on Port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` S.A.F.A.R. Tourist Safety & Blockchain Network`);
  console.log(`=======================================================`);
});
