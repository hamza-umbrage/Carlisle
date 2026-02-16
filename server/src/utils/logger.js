function log(level, message, data) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (data) {
    console[level === 'error' ? 'error' : 'log'](entry, data);
  } else {
    console[level === 'error' ? 'error' : 'log'](entry);
  }
}

module.exports = {
  info: (msg, data) => log('info', msg, data),
  error: (msg, data) => log('error', msg, data),
  warn: (msg, data) => log('warn', msg, data),
};
