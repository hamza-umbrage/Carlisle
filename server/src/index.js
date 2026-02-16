const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security headers (CSP off for inline scripts in existing HTML)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/warranties', require('./routes/warranties'));
app.use('/api/products', require('./routes/products'));
app.use('/api/jobs', require('./routes/documents'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/sales-reps', require('./routes/salesReps'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve existing static frontend from the project root (parent of server/)
const staticRoot = path.join(__dirname, '../../');
app.use(express.static(staticRoot));

// Fallback: serve index.html for any non-API, non-static route
app.get('*', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

// Error handler (must be last middleware)
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Carlisle CCM API running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

module.exports = app;
