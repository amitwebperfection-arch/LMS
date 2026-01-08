const { sendEmail } = require('../config/mail');
const nodemailer = require('nodemailer');


const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to LMS Platform!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for registering with us. We're excited to have you on board!</p>
    <p>Start exploring our courses and enhance your skills.</p>
    <br>
    <p>Best regards,</p>
    <p>LMS Team</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to LMS Platform',
    html,
  });
};

const sendVerificationEmail = async (user, verificationUrl) => {
  const html = `
    <h1>Email Verification</h1>
    <p>Hi ${user.name},</p>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <br>
    <p>Best regards,</p>
    <p>LMS Team</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Email Verification',
    html,
  });
};


const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,</p>
    <p>LMS Team</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html,
  });
};


const sendEnrollmentEmail = async (user, course) => {
  const html = `
    <h1>Enrollment Confirmation</h1>
    <p>Hi ${user.name},</p>
    <p>Congratulations! You have successfully enrolled in:</p>
    <h2>${course.title}</h2>
    <p>Start learning now and enhance your skills!</p>
    <a href="${process.env.FRONTEND_URL}/my-courses" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View My Courses</a>
    <br><br>
    <p>Best regards,</p>
    <p>LMS Team</p>
  `;

  await sendEmail({
    email: user.email,
    subject: `Enrollment Confirmation - ${course.title}`,
    html,
  });
};

const sendCertificateEmail = async (user, course, pdfUrl) => {
  try {
    console.log('📧 Sending certificate email to:', user.email);

    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const certificateViewUrl = `${frontendUrl}/student/certificates`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .certificate-icon {
            font-size: 60px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .course-title {
            color: #4CAF50;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            padding: 15px;
            background: #f1f8f4;
            border-left: 4px solid #4CAF50;
            border-radius: 4px;
          }
          .btn {
            display: inline-block;
            padding: 15px 40px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 25px 0;
            font-weight: bold;
            font-size: 16px;
          }
          .btn:hover {
            background-color: #45a049;
          }
          .features {
            margin: 30px 0;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
          }
          .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4CAF50;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f9f9f9;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="certificate-icon">🎓</div>
            <h1>Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">You've earned your certificate</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${user.name}</strong>,</p>
            
            <p>🎉 <strong>Congratulations!</strong> You have successfully completed:</p>
            
            <div class="course-title">${course.title}</div>
            
            <p>Your certificate of completion is now ready! This certificate validates your achievement and demonstrates your commitment to continuous learning.</p>
            
            <div style="text-align: center;">
              <a href="${certificateViewUrl}" class="btn">View & Download Certificate</a>
            </div>
            
            <div class="features">
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Download your certificate in PDF format</li>
                <li>Share it on LinkedIn and professional networks</li>
                <li>Add it to your resume and portfolio</li>
                <li>Continue your learning journey with more courses</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              Keep up the excellent work and continue expanding your skills!
            </p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The LMS Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: `🎓 Certificate Ready - ${course.title}`,
      html,
    });

    console.log('✅ Certificate email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send certificate email:', error);
    throw error;
  }
};


const sendCourseApprovalEmail = async (instructor, course, isApproved) => {
  const status = isApproved ? 'approved' : 'rejected';
  const html = `
    <h1>Course ${status}</h1>
    <p>Hi ${instructor.name},</p>
    <p>Your course "${course.title}" has been ${status}.</p>
    ${
      isApproved
        ? '<p>Students can now enroll in your course!</p>'
        : '<p>Please review the feedback and make necessary changes.</p>'
    }
    <a href="${process.env.FRONTEND_URL}/instructor/courses" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Courses</a>
    <br><br>
    <p>Best regards,</p>
    <p>LMS Team</p>
  `;

  await sendEmail({
    email: instructor.email,
    subject: `Course ${status} - ${course.title}`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEnrollmentEmail,
  sendCertificateEmail,
  sendCourseApprovalEmail,
};