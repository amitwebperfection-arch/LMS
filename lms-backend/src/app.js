const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const app = express();


app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' })
);


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsPath = path.join(__dirname, '..', 'uploads');

console.log('Serving uploads from:', uploadsPath);

app.use('/uploads/', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/instructor', require('./routes/instructor.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/instructor/sections', require('./routes/section.routes'));
app.use('/api/instructor/lessons', require('./routes/lesson.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/resumes', require('./routes/resume.routes'));

app.use(require('./middleware/error.middleware').notFound);
app.use(require('./middleware/error.middleware').errorHandler);

module.exports = app;