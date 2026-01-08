# 🎓 LMS Backend - Complete Production-Ready API

A comprehensive Learning Management System backend built with Node.js, Express, MongoDB, and integrated with Stripe for payments, Cloudinary for media storage.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Security Features](#security-features)
- [Deployment](#deployment)

---

## ✨ Features

### 👥 User Management
- **Three Role System**: Admin, Instructor, Student
- User registration & authentication (JWT)
- Password reset via email
- Profile management
- Account blocking/unblocking (Admin)

### 📚 Course Management
- Create, update, delete courses
- Course approval workflow
- Sections & lessons with video upload
- Course categories
- Search & filter functionality
- Course ratings & reviews

### 💰 Payment System
- Stripe payment integration
- Secure webhook handling
- Order management
- Coupon system
- Invoice generation
- Refund support

### 🎯 Learning Features
- Course enrollment
- Progress tracking
- Lesson completion tracking
- Watch time tracking
- Resume last watched lesson
- Certificate generation (PDF)

### 📊 Analytics & Reports
- Admin dashboard with stats
- Instructor earnings tracking
- Sales reports
- User statistics
- Course analytics

### 🔔 Notifications
- In-app notifications
- Email notifications
- Unread count tracking

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Payment**: Stripe
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **PDF Generation**: PDFKit

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Stripe account
- SMTP server (Gmail, SendGrid, etc.)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd lms-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see below)

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://amitlms:%21%40%23%24%25@lms.6wc6rbx.mongodb.net/lms?retryWrites=true&w=majority&appName=lms


# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email (Nodemailer)
SMTP_HOST=smtp.emailtest.dev
SMTP_PORT=2525
SMTP_EMAIL=user_N8KNSnvopO34fDf5
SMTP_PASSWORD=OVWBG6GdAXkWFB4KyH8Bpw
FROM_EMAIL=default-li7ldo3glnkvgwr32beucllb@local
FROM_NAME=LMS Platform



# Cloudinary
CLOUDINARY_CLOUD_NAME=dcaublx3n
CLOUDINARY_API_KEY=784734272515381
CLOUDINARY_API_SECRET=4ERjSmjW0EQfUtFpVQ4tHsRVfus

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Frontend URL
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📁 Project Structure

```
lms-backend/
├── src/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary config
│   │   ├── stripe.js                # Stripe config
│   │   └── mail.js                  # Email config
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication
│   │   ├── admin.controller.js      # Admin operations
│   │   ├── instructor.controller.js # Instructor operations
│   │   ├── student.controller.js    # Student operations
│   │   ├── course.controller.js     # Course management
│   │   ├── section.controller.js    # Section management
│   │   ├── lesson.controller.js     # Lesson management
│   │   ├── enrollment.controller.js # Enrollment management
│   │   ├── progress.controller.js   # Progress tracking
│   │   ├── order.controller.js      # Order management
│   │   ├── payment.controller.js    # Payment handling
│   │   ├── review.controller.js     # Review management
│   │   ├── certificate.controller.js # Certificate generation
│   │   └── notification.controller.js # Notifications
│   │
│   ├── models/
│   │   ├── User.model.js            # User schema
│   │   ├── Course.model.js          # Course schema
│   │   ├── Category.model.js        # Category schema
│   │   ├── Section.model.js         # Section schema
│   │   ├── Lesson.model.js          # Lesson schema
│   │   ├── Enrollment.model.js      # Enrollment schema
│   │   ├── Progress.model.js        # Progress schema
│   │   ├── Order.model.js           # Order schema
│   │   ├── Payment.model.js         # Payment schema
│   │   ├── Review.model.js          # Review schema
│   │   ├── Coupon.model.js          # Coupon schema
│   │   ├── Notification.model.js    # Notification schema
│   │   └── Certificate.model.js     # Certificate schema
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # Auth routes
│   │   ├── admin.routes.js          # Admin routes
│   │   ├── instructor.routes.js     # Instructor routes
│   │   ├── student.routes.js        # Student routes
│   │   ├── course.routes.js         # Course routes
│   │   ├── section.routes.js        # Section routes
│   │   ├── lesson.routes.js         # Lesson routes
│   │   ├── enrollment.routes.js     # Enrollment routes
│   │   ├── progress.routes.js       # Progress routes
│   │   ├── order.routes.js          # Order routes
│   │   ├── payment.routes.js        # Payment routes
│   │   ├── review.routes.js         # Review routes
│   │   ├── certificate.routes.js    # Certificate routes
│   │   └── notification.routes.js   # Notification routes
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT authentication
│   │   ├── role.middleware.js       # Role-based access
│   │   ├── error.middleware.js      # Error handling
│   │   ├── upload.middleware.js     # File upload
│   │   └── rateLimit.middleware.js  # Rate limiting
│   │
│   ├── services/
│   │   ├── email.service.js         # Email templates
│   │   └── certificate.service.js   # Certificate PDF generation
│   │
│   ├── utils/
│   │   ├── generateToken.js         # JWT token generator
│   │   ├── apiResponse.js           # API response formatter
│   │   ├── slugify.js               # Slug generator
│   │   └── constants.js             # Constants
│   │
│   ├── app.js                       # Express app setup
│   └── server.js                    # Server entry point
│
├── uploads/                         # Upload directory
├── .env                             # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Main Endpoints

#### 🔐 Authentication
```
POST   /auth/register              # Register new user
POST   /auth/login                 # Login
GET    /auth/me                    # Get current user
POST   /auth/forgot-password       # Forgot password
POST   /auth/reset-password        # Reset password
POST   /auth/logout                # Logout
```

#### 👑 Admin
```
GET    /admin/dashboard            # Dashboard stats
GET    /admin/users                # Get all users
PUT    /admin/users/:id/block      # Block user
PUT    /admin/users/:id/unblock    # Unblock user
GET    /admin/courses              # Get all courses
PUT    /admin/courses/:id/approve  # Approve course
POST   /admin/categories           # Create category
GET    /admin/reports/sales        # Sales report
```

#### 🧑‍🏫 Instructor
```
GET    /instructor/dashboard       # Instructor dashboard
POST   /instructor/courses         # Create course
GET    /instructor/courses         # Get instructor courses
PUT    /instructor/courses/:id     # Update course
DELETE /instructor/courses/:id     # Delete course
GET    /instructor/enrollments     # Get enrollments
GET    /instructor/earnings        # Get earnings
```

#### 🎓 Student
```
GET    /student/dashboard          # Student dashboard
GET    /student/my-courses         # Get enrolled courses
GET    /student/certificates       # Get certificates
GET    /student/statistics         # Learning statistics
```

#### 📚 Courses
```
GET    /courses                    # Get all courses (public)
GET    /courses/:slug              # Get course by slug
```

#### 📝 Sections & Lessons
```
POST   /sections                   # Create section
GET    /sections                   # Get sections
PUT    /sections/:id               # Update section
DELETE /sections/:id               # Delete section

POST   /lessons                    # Create lesson
GET    /lessons                    # Get lessons
PUT    /lessons/:id                # Update lesson
DELETE /lessons/:id                # Delete lesson
```

#### 💳 Orders & Payments
```
POST   /orders                     # Create order
GET    /orders/my-orders           # Get user orders
POST   /payment/webhook            # Stripe webhook
```

#### 📊 Progress
```
GET    /progress/:courseId         # Get course progress
POST   /progress/complete-lesson   # Mark lesson complete
PUT    /progress/watch-time        # Update watch time
```

#### ⭐ Reviews
```
POST   /reviews                    # Add review
GET    /reviews/course/:courseId   # Get course reviews
PUT    /reviews/:id                # Update review
DELETE /reviews/:id                # Delete review
```

#### 📜 Certificates
```
POST   /certificates/:courseId     # Generate certificate
GET    /certificates               # Get user certificates
GET    /certificates/verify/:id    # Verify certificate
```

---

## 🗄 Database Models

### User
- name, email, password (hashed)
- role (admin/instructor/student)
- avatar, bio
- isEmailVerified, isActive, isBlocked

### Course
- title, slug, description
- instructor, category
- price, discountPrice
- thumbnail, tags
- rating, enrollmentCount
- status (draft/published/archived)

### Section
- title, course
- order, description

### Lesson
- title, section
- videoUrl, duration
- isPreview, resources

### Enrollment
- user, course, order
- progress, isCompleted
- enrolledAt, completedAt

### Progress
- user, course
- completedLessons[]
- lastWatchedLesson
- progressPercentage

### Order
- user, course
- amount, discount, coupon
- status, paymentIntentId

### Payment
- order, user
- stripePaymentIntentId
- amount, status

### Review
- user, course
- rating (1-5), comment
- status (pending/approved/rejected)

### Certificate
- user, course
- certificateId (unique)
- pdfUrl, verificationUrl

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcrypt with salt  
✅ **Rate Limiting** - Prevent API abuse  
✅ **Helmet** - Security headers  
✅ **CORS** - Cross-origin protection  
✅ **Input Validation** - express-validator  
✅ **File Upload Validation** - Type & size checks  
✅ **Signed Video URLs** - Cloudinary signed URLs  
✅ **Stripe Webhook Verification** - Signature validation  
✅ **Role-Based Access Control** - Granular permissions  
✅ **SQL Injection Prevention** - Mongoose sanitization  

---

## 🚀 Deployment

### Option 1: Heroku

1. Create a Heroku app
2. Add MongoDB Atlas connection string
3. Set environment variables
4. Deploy:
```bash
git push heroku main
```

### Option 2: VPS (DigitalOcean, AWS, etc.)

1. Install Node.js and MongoDB
2. Clone repository
3. Install dependencies
4. Set environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start src/server.js --name lms-backend
pm2 save
```

### Option 3: Docker

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🧪 Testing

```bash
# Run tests (if implemented)
npm test
```

---

## 📝 License

MIT

---

## 👨‍💻 Author

Your Name

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For support, email your-email@example.com

---

## 🎉 Acknowledgments

- Express.js community
- MongoDB team
- Stripe documentation
- Cloudinary team