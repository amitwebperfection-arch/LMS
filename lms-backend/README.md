# 🎓 LMS Backend - Complete Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [File Upload System](#file-upload-system)
- [Payment Integration](#payment-integration)
- [Email Service](#email-service)
- [Certificate Generation](#certificate-generation)
- [Installation & Running](#installation--running)

---

## 🌟 Overview

Yeh ek complete **Learning Management System (LMS)** ka backend hai jo Node.js, Express aur MongoDB par bana hai. Isme teen main roles hain:
- **Admin**: Platform ko manage karta hai
- **Instructor**: Courses create karta hai
- **Student**: Courses enroll karke seekhta hai

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **Stripe** | Payment processing |
| **Cloudinary** | Media storage (images/videos) |
| **Nodemailer** | Email service |
| **PDFKit** | Certificate generation |
| **Multer** | File upload handling |
| **bcryptjs** | Password hashing |

---

## 📦 Package.json Overview

### Project Information
```json
{
  "name": "lms-backend",
  "version": "1.0.0",
  "description": "Learning Management System Backend",
  "main": "src/server.js"
}
```

### Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm start` | Production mode mein server start hota hai | Deployment ke liye |
| `npm run dev` | Development mode with auto-restart (nodemon) | Local development ke liye |
| `npm test` | Jest test suite chalata hai | Testing ke liye |

**Example Usage:**
```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test
```

### Core Dependencies

#### **Backend Framework**
- **express (^4.18.2)**: Web server framework
- **cors (^2.8.5)**: Cross-Origin Resource Sharing
- **helmet (^7.1.0)**: Security headers
- **express-async-handler (^1.2.0)**: Async error handling
- **express-rate-limit (^7.1.5)**: API rate limiting
- **express-validator (^7.0.1)**: Input validation

#### **Database & Authentication**
- **mongoose (^8.0.3)**: MongoDB ODM
- **bcryptjs (^2.4.3)**: Password encryption
- **jsonwebtoken (^9.0.2)**: JWT token generation

#### **Payment Integration**
- **stripe (^14.9.0)**: Payment gateway (backend)
- **@stripe/stripe-js (^8.6.0)**: Stripe client library
- **@stripe/react-stripe-js (^5.4.1)**: React components (if needed)

#### **File & Media Handling**
- **multer (^1.4.5-lts.1)**: File upload middleware
- **cloudinary (^1.41.3)**: Cloud storage for images/videos

#### **Email Service**
- **nodemailer (^6.10.1)**: Email sending

#### **PDF & Utilities**
- **pdfkit (^0.13.0)**: Certificate PDF generation
- **slugify (^1.6.6)**: URL-friendly slugs
- **dotenv (^16.6.1)**: Environment variables
- **winston (^3.11.0)**: Logging (optional)

### Development Dependencies

| Package | Purpose |
|---------|---------|
| **nodemon (^3.0.2)** | Auto-restart server on file changes |
| **jest (^29.7.0)** | Testing framework |

---

## 📁 Project Structure

```
lms-backend/
│
├── src/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary setup (image/video upload)
│   │   ├── db.js               # MongoDB connection
│   │   ├── mail.js             # Email configuration
│   │   └── stripe.js           # Stripe payment setup
│   │
│   ├── controllers/            # Request handlers (business logic)
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── certificate.controller.js
│   │   ├── contact.controller.js
│   │   ├── course.controller.js
│   │   ├── instructor.controller.js
│   │   ├── lesson.controller.js
│   │   ├── notification.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── progress.controller.js
│   │   ├── resume.controller.js
│   │   ├── review.controller.js
│   │   ├── section.controller.js
│   │   └── student.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js     # Error handling
│   │   ├── rateLimit.middleware.js # Request rate limiting
│   │   ├── role.middleware.js      # Role-based access
│   │   └── upload.middleware.js    # File upload handling
│   │
│   ├── models/                 # Database schemas
│   │   ├── Category.model.js
│   │   ├── Certificate.model.js
│   │   ├── Contact.model.js
│   │   ├── Coupon.model.js
│   │   ├── Course.model.js
│   │   ├── Enrollment.model.js
│   │   ├── Lesson.model.js
│   │   ├── Notification.model.js
│   │   ├── Order.model.js
│   │   ├── Payment.model.js
│   │   ├── Progress.model.js
│   │   ├── Resume.model.js
│   │   ├── Review.model.js
│   │   ├── Section.model.js
│   │   └── User.model.js
│   │
│   ├── routes/                 # API route definitions
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── certificate.routes.js
│   │   ├── contact.routes.js
│   │   ├── course.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── instructor.routes.js
│   │   ├── lesson.routes.js
│   │   ├── notification.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── progress.routes.js
│   │   ├── resume.routes.js
│   │   ├── review.routes.js
│   │   ├── section.routes.js
│   │   └── student.routes.js
│   │
│   ├── services/
│   │   ├── certificate.service.js  # PDF generation
│   │   └── email.service.js        # Email templates
│   │
│   ├── utils/
│   │   ├── apiResponse.js      # Standardized responses
│   │   ├── constants.js        # App constants
│   │   ├── generateToken.js    # JWT token creation
│   │   └── slugify.js          # URL slug generation
│   │
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
│
├── scripts/
│   └── migrate.js              # Database migration
│
├── uploads/                    # Temporary file storage
│   └── certificates/           # Generated PDFs
│
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Environment Setup

`.env` file mein yeh variables chahiye:

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
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 💾 Database Models

### 1. **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'instructor', 'student'],
  avatar: { url, publicId },
  bio: String,
  phone: String,
  preferences: {
    emailNotifications: Boolean,
    language: String,
    timezone: String
  },
  instructorProfile: {
    rating: Number,
    totalStudents: Number,
    expertise: [String]
  }
}
```

### 2. **Course Model**
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  instructor: ObjectId (User),
  category: ObjectId (Category),
  thumbnail: { url, publicId },
  price: Number,
  discountPrice: Number,
  difficulty: ['beginner', 'intermediate', 'advanced'],
  status: ['draft', 'published', 'archived'],
  isFree: Boolean,
  rating: Number,
  enrollmentCount: Number,
  isApproved: Boolean,
  certificateEnabled: Boolean
}
```

### 3. **Enrollment Model**
```javascript
{
  user: ObjectId (User),
  course: ObjectId (Course),
  order: ObjectId (Order),
  enrolledAt: Date,
  isCompleted: Boolean,
  progress: Number (0-100),
  certificateIssued: Boolean
}
```

### 4. **Order Model**
```javascript
{
  user: ObjectId (User),
  course: ObjectId (Course),
  amount: Number,
  status: ['pending', 'completed', 'failed'],
  paymentIntentId: String (Stripe),
  coupon: ObjectId (Coupon)
}
```

### 5. **Certificate Model**
```javascript
{
  user: ObjectId (User),
  course: ObjectId (Course),
  certificateId: String (unique),
  pdfUrl: String,
  verificationUrl: String,
  issuedAt: Date
}
```

---

## 🔌 API Endpoints

### **Authentication APIs**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| PUT | `/api/auth/update-profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### **Course APIs (Public)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with filters) |
| GET | `/api/courses/:slug` | Get single course |

**Query Parameters for `/api/courses`:**
- `page`, `limit` - Pagination
- `category`, `subCategory` - Filter by category
- `difficulty` - beginner/intermediate/advanced
- `search` - Search in title/description
- `minPrice`, `maxPrice` - Price range
- `isFree` - Free courses only
- `sort` - Sorting order

### **Instructor APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/instructor/courses` | Create course |
| GET | `/api/instructor/courses` | Get instructor's courses |
| GET | `/api/instructor/courses/:id` | Get single course |
| PUT | `/api/instructor/courses/:id` | Update course |
| DELETE | `/api/instructor/courses/:id` | Delete course |
| PUT | `/api/instructor/courses/:id/publish` | Toggle publish status |
| GET | `/api/instructor/dashboard` | Instructor stats |
| GET | `/api/instructor/enrollments` | Student enrollments |
| GET | `/api/instructor/earnings` | Revenue stats |

### **Section APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/instructor/sections` | Create section |
| GET | `/api/instructor/sections` | Get sections by course |
| PUT | `/api/instructor/sections/:id` | Update section |
| DELETE | `/api/instructor/sections/:id` | Delete section |
| PUT | `/api/instructor/sections/reorder` | Reorder sections |

### **Lesson APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/instructor/lessons` | Create lesson |
| GET | `/api/instructor/lessons` | Get lessons by section |
| PUT | `/api/instructor/lessons/:id` | Update lesson |
| DELETE | `/api/instructor/lessons/:id` | Delete lesson |
| PUT | `/api/instructor/lessons/:id/preview` | Toggle preview |

### **Student APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Student dashboard |
| GET | `/api/student/my-courses` | Enrolled courses |
| GET | `/api/student/check-enrollment/:courseId` | Check if enrolled |
| GET | `/api/student/certificates` | My certificates |
| GET | `/api/student/statistics` | Learning stats |

### **Order & Payment APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (enroll) |
| GET | `/api/orders/my-orders` | User's orders |
| GET | `/api/orders/:id` | Single order |
| POST | `/api/payment/webhook` | Stripe webhook |
| GET | `/api/payment/verify/:orderId` | Verify payment |

### **Progress APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/:courseId` | Get course progress |
| POST | `/api/progress/complete-lesson` | Mark lesson complete |
| PUT | `/api/progress/watch-time` | Update watch time |
| DELETE | `/api/progress/:courseId/reset` | Reset progress |

### **Certificate APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/certificates/:courseId` | Generate certificate |
| GET | `/api/certificates/:courseId` | Get certificate by course |
| GET | `/api/certificates` | All user certificates |
| GET | `/api/certificates/:courseId/download` | Download PDF |
| GET | `/api/certificates/verify/:certificateId` | Verify certificate |

### **Review APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Add review |
| GET | `/api/reviews/course/:courseId` | Course reviews |
| GET | `/api/reviews/my-review/:courseId` | User's review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### **Admin APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/block` | Block user |
| PUT | `/api/admin/users/:id/unblock` | Unblock user |
| GET | `/api/admin/courses` | All courses |
| PUT | `/api/admin/courses/:id/approve` | Approve course |
| PUT | `/api/admin/courses/:id/reject` | Reject course |
| POST | `/api/admin/categories` | Create category |
| GET | `/api/admin/reports/sales` | Sales report |

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. **Registration/Login:**
```javascript
// User registers/logs in
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

2. **Protected Route Access:**
```javascript
// Header mein token bhejo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Middleware Verification:**
```javascript
// auth.middleware.js
- Token extract karta hai
- JWT verify karta hai
- User details req.user mein store karta hai
```

### Role-Based Access

```javascript
// Role middleware check karta hai
authorize('admin', 'instructor') // Only admin aur instructor access kar sakte
authorize('student') // Only student access kar sakta
```

---

## 📤 File Upload System

### Cloudinary Integration

**Image Upload (Thumbnail):**
```javascript
// Course thumbnail upload hota hai
POST /api/instructor/courses
Content-Type: multipart/form-data

thumbnail: [File]
title: "Course Title"
...

// Result
{
  url: "https://res.cloudinary.com/...",
  publicId: "lms/courses/xyz123"
}
```

**Video Upload (Lessons):**
```javascript
// Lesson video upload
POST /api/instructor/lessons
Content-Type: multipart/form-data

video: [File]
title: "Lesson Title"
...

// Cloudinary automatically compresses
// Result includes duration
```

**Upload Process:**
1. Multer file ko temporarily save karta hai
2. Cloudinary par upload hota hai
3. Local file delete ho jati hai
4. URL aur publicId database mein save hote hain

---

## 💳 Payment Integration (Stripe)

### Payment Flow

**1. Order Creation (FREE Course):**
```javascript
POST /api/orders
{
  "courseId": "abc123",
  "couponCode": "DISCOUNT50"
}

// Agar isFree === true ya price === 0
// Direct enrollment ho jata hai
// Status: completed
```

**2. Order Creation (PAID Course):**
```javascript
POST /api/orders
{
  "courseId": "abc123"
}

// Response
{
  "order": {...},
  "clientSecret": "pi_xxx_secret_yyy" // Stripe payment intent
}

// Frontend isse use karke payment complete karta hai
```

**3. Stripe Webhook:**
```javascript
POST /api/payment/webhook
// Stripe automatically call karta hai

// payment_intent.succeeded event par:
1. Payment record create hoti hai
2. Order status "completed" hoti hai
3. Enrollment create hota hai
4. Progress initialize hota hai
5. Email send hota hai
```

### Webhook Setup

```bash
# Stripe CLI se local testing
stripe listen --forward-to localhost:5000/api/payment/webhook

# Production mein Stripe dashboard se webhook add karo
```

---

## 📧 Email Service

### Email Templates

**1. Welcome Email:**
```javascript
// Registration ke baad automatically send hota hai
sendWelcomeEmail(user)
```

**2. Enrollment Email:**
```javascript
// Course enrollment ke baad
sendEnrollmentEmail(user, course)
```

**3. Certificate Email:**
```javascript
// Certificate generate hone par
sendCertificateEmail(user, course, pdfUrl)
```

**4. Password Reset:**
```javascript
// Forgot password request par
sendPasswordResetEmail(user, resetUrl)
```

### SMTP Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password # Gmail App Password use karo
```

**Gmail App Password Kaise Banaye:**
1. Google Account → Security
2. 2-Step Verification enable karo
3. App Passwords generate karo
4. Wo password `.env` mein use karo

---

## 🎓 Certificate Generation

### PDF Generation Process

**1. Request:**
```javascript
POST /api/certificates/:courseId

// Prerequisites:
- User enrolled hona chahiye
- Course 100% complete hona chahiye
- Certificate enabled hona chahiye
```

**2. Generation:**
```javascript
// certificate.service.js
- PDFKit use karke PDF banta hai
- User name, course title, instructor name add hote hain
- Unique Certificate ID generate hota hai
- PDF file `uploads/certificates/` mein save hoti hai
```

**3. Certificate Features:**
- Professional design with borders
- Course title aur student name
- Issue date
- Instructor signature
- Verification URL
- Unique Certificate ID

**4. Download:**
```javascript
GET /api/certificates/:courseId/download
// PDF file download ho jati hai
```

**5. Verification:**
```javascript
GET /api/certificates/verify/:certificateId
// Public API - Koi bhi verify kar sakta hai
```

---

## 🚀 Installation & Running

### 1. Clone Repository
```bash
git clone <repository-url>
cd lms-backend
```

### 2. Install Dependencies
```bash
npm install
```

**Kya install hoga:**
- Express server framework
- MongoDB database connection
- Stripe payment integration
- Cloudinary media storage
- Email service (Nodemailer)
- Security packages (Helmet, CORS)
- File upload (Multer)
- PDF generation (PDFKit)
- 20+ other essential packages

**Installation time:** ~2-3 minutes (internet speed par depend karta hai)

**Common Installation Issues:**

```bash
# Issue: node-gyp errors (Windows)
Solution:
npm install --global windows-build-tools
npm install

# Issue: Permission denied (Mac/Linux)
Solution:
sudo npm install

# Issue: Package version conflicts
Solution:
rm -rf node_modules package-lock.json
npm install
```

### 3. Environment Setup
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 4. Database Migration (Optional)
```bash
# Run migration script for new fields
node scripts/migrate.js
```

### 5. Start Server

**Development Mode:**
```bash
npm run dev
# Server starts on http://localhost:5000
```

**Production Mode:**
```bash
npm start
```

### 6. Verify Server
```bash
# Health check
curl http://localhost:5000/health

# Response:
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-08T10:30:00.000Z"
}
```

---

## 🔍 Testing APIs

### Postman Collection Setup

**1. Environment Variables:**
```
BASE_URL = http://localhost:5000
TOKEN = {{auth_token}}
```

**2. Test Flow:**

```bash
# Step 1: Register
POST {{BASE_URL}}/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}

# Step 2: Login (Copy token from response)
POST {{BASE_URL}}/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Step 3: Get Courses
GET {{BASE_URL}}/api/courses
Authorization: Bearer {{TOKEN}}

# Step 4: Enroll in Free Course
POST {{BASE_URL}}/api/orders
Authorization: Bearer {{TOKEN}}
{
  "courseId": "course_id_here"
}
```

---

## 📊 Key Features Summary

### ✅ Completed Features

1. **User Management**
   - Registration, Login, Profile
   - Password reset
   - Role-based access

2. **Course Management**
   - Create, Update, Delete courses
   - Sections & Lessons
   - Video/Quiz/Reading lessons
   - Course approval workflow

3. **Enrollment System**
   - Free & Paid enrollments
   - Stripe payment integration
   - Progress tracking
   - Certificate generation

4. **Media Handling**
   - Cloudinary integration
   - Image/Video uploads
   - Automatic compression

5. **Certificate System**
   - PDF generation
   - Email delivery
   - Public verification
   - Unique IDs

6. **Review System**
   - Add/Edit reviews
   - Rating system
   - Instructor replies
   - Admin moderation

7. **Admin Panel**
   - User management
   - Course approval
   - Sales reports
   - Platform statistics

---

## 🛡️ Security Features

1. **Password Security**: bcrypt hashing
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Mongoose validators
5. **CORS**: Configured for frontend
6. **Helmet.js**: Security headers
7. **MongoDB Injection Protection**: Mongoose sanitization

---

## 📈 Performance Optimizations

1. **Database Indexing**: Frequently queried fields
2. **Pagination**: Large data handling
3. **Cloudinary CDN**: Fast media delivery
4. **Populate Limiting**: Only required fields
5. **Error Handling**: Consistent responses

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```bash
Error: connect ECONNREFUSED

Solution:
- Check MONGO_URI in .env
- Verify MongoDB Atlas whitelist
- Check network connection
```

### Issue 2: Stripe Webhook Failed
```bash
Error: Webhook signature verification failed

Solution:
- Verify STRIPE_WEBHOOK_SECRET
- Check webhook endpoint URL
- Use `stripe listen` for local testing
```

### Issue 3: File Upload Failed
```bash
Error: Image upload failed

Solution:
- Verify Cloudinary credentials
- Check file size limits
- Ensure uploads/ directory exists
```

### Issue 4: Email Not Sending
```bash
Error: Failed to send email

Solution:
- Check SMTP credentials
- Use Gmail App Password (not account password)
- Enable "Less secure app access" if needed
```

---

## 📞 Support

For issues or queries:
- Check console logs for detailed errors
- Verify all .env variables
- Test with Postman/Insomnia
- Check MongoDB Atlas dashboard for connection

---

## 🎯 Next Steps

1. Deploy backend on Render/Railway
2. Set up production MongoDB
3. Configure Stripe production keys
4. Set up custom domain
5. Enable HTTPS

---

## 📦 Package Management

### Install New Package
```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name
```

### Update Packages
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update package-name
```

### Remove Package
```bash
npm uninstall package-name
```

### Check Package Info
```bash
# List all installed packages
npm list

# Check specific package version
npm list package-name

# View package details
npm view package-name
```

---

## 🔧 Dependency Details

### Why These Packages?

**Express.js**: 
- Fast aur minimal web framework
- Middleware support
- Routing capabilities

**Mongoose**: 
- MongoDB ke liye elegant ODM
- Schema validation
- Middleware (hooks)
- Query building

**JWT (jsonwebtoken)**:
- Stateless authentication
- Secure token generation
- Expiry management

**Stripe**:
- Industry standard payment gateway
- PCI compliant
- Webhook support
- Test mode for development

**Cloudinary**:
- Free tier: 25GB storage
- Automatic optimization
- CDN delivery
- Video transcoding

**Nodemailer**:
- Multiple transport support
- HTML email templates
- Attachment support

**PDFKit**:
- Pure JavaScript PDF generation
- No external dependencies
- Customizable design

**Multer**:
- Express middleware
- Multipart/form-data handling
- File size limits
- File type filtering

**bcryptjs**:
- Slow hashing (security)
- Salt generation
- Pure JavaScript (cross-platform)

**Helmet**:
- 14 security middleware
- XSS protection
- CSRF protection

**Express Rate Limit**:
- DDoS protection
- API abuse prevention
- Customizable limits

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Node Version:** 18.x or higher