const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const startAutoLogoutCron = require("./cron/autoLogout");
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB  = require('./config/database');
const Logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const TimeTrackingMonitor = require('./utils/timeTrackingMonitor');

// Routes
const adminRoutes = require('./routes/admin/admin');
const userRoutes = require('./routes/user/user');
const clientRoutes = require('./routes/client/client');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_WINDOW_MINUTES) * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_WINDOW_MINUTES) * 60 * 1000,
  max: parseInt(process.env.MAX_LOGIN_ATTEMPTS),
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// app.use('/api/', apiLimiter);
// app.use('/api/v1/admin/auth/login', loginLimiter);
// app.use('/api/v1/user/auth/login', loginLimiter);

// Logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/client', clientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err) => {
  await Logger.error('Unhandled Promise Rejection', 'PROCESS', err);
  process.exit(1);
});
    
// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  await Logger.error('Uncaught Exception', 'PROCESS', err);                                                                                                         
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
                       
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  await Logger.info(`Server started on port ${PORT}`, 'SERVER_START', { port: PORT, env: process.env.NODE_ENV });
  
  // Start time tracking monitor
  TimeTrackingMonitor.start();
     startAutoLogoutCron();
});

module.exports = app;


