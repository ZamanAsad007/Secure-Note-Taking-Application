const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Security headers
app.use(helmet());

// Body parser with 100kb payload limit
app.use(express.json({ limit: '100kb' }));

// Serve static files from public if directory exists
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
