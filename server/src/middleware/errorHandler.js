const config = require('../config/env');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error(err.message, err.stack);

  // Validation errors
  if (err.type === 'validation') {
    return res.status(400).json({ error: err.message, fields: err.fields });
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  const status = err.status || 500;
  const message =
    config.nodeEnv === 'production' ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
