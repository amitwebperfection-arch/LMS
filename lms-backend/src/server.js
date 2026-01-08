require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const dirs = [
  'uploads',
  'uploads/certificates',
  'uploads/temp',
];

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});


connectDB();

const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('========================================');
});


process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

