const mongoose = require('mongoose');
const config = require('./config/env');
const app = require('./app');

let server;

async function startServer() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    const sanitizedUri = config.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connected to MongoDB at ${sanitizedUri}`);

    server = app.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      console.log('Server and database connection closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
