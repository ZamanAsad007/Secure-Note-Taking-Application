const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Security headers
app.use(helmet());

// CORS support for frontend dev server
app.use(cors());

// Body parser with 100kb payload limit
app.use(express.json({ limit: '100kb' }));

// Serve static files from public or client/dist if exists
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const usersRoutes = require('./routes/users.routes');
const postsRoutes = require('./routes/posts.routes');

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);

// Serve SPA fallback for client if client/dist/index.html exists
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const clientDistIndex = path.join(__dirname, '..', 'client', 'dist', 'index.html');
  res.sendFile(clientDistIndex, (err) => {
    if (err) next();
  });
});

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
