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

const path = require('path');
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving for uploaded proof photographs
const uploadsRoot = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
app.use('/uploads', express.static(uploadsRoot));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'S.A.F.A.R. - Smart AI Framework for Assured & Responsible Tourism Backend',
    framework: 'Smart AI Framework for Assured & Responsible Tourism',
    problemStatement: {
      id: '26204',
      title: 'Student Innovation-A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others.',
      theme: 'Travel & Tourism',
      category: 'Software',
      organization: 'AICTE'
    },
    ministry: 'Ministry of Tourism, Govt. of India',
    timestamp: new Date().toISOString()
  });
});

// Register Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tourists', require('./routes/touristRoutes'));
app.use('/api/digital-id', require('./routes/digitalIdRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));

// Direct SOS route compatibility for frontend calls (/api/sos and /api/sos/cancel)
const { triggerSOS, cancelSOS } = require('./controllers/incidentController');
app.post('/api/sos', triggerSOS);
app.post('/api/sos/cancel', cancelSOS);
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
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api/fares', require('./routes/fareRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/green-rewards', require('./routes/rewardRoutes'));

// Serve Frontend in Production / Cloud Deployments
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

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
