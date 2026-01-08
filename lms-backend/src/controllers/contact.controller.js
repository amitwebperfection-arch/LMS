const Contact = require('../models/Contact.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendEmail } = require('../config/mail'); 

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 400, 'Name, email, and message are required');
    }

    const contactMessage = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    
    try {
      await sendEmail({
        email: process.env.FROM_EMAIL, 
        subject: `New Contact Message from ${name}`,
        html: `
          <h1>New Contact Message</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
    }

    successResponse(res, 201, 'Message submitted successfully', { contactMessage });
  } catch (error) {
    console.error('Contact submit error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Admin
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    successResponse(res, 200, 'Messages fetched successfully', messages);
  } catch (error) {
    console.error('Get messages error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

// @desc    Update message status
// @route   PATCH /api/contact/:id/status
// @access  Admin
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status');
    }

    const message = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return errorResponse(res, 404, 'Message not found');
    }

    successResponse(res, 200, 'Status updated successfully', message);
  } catch (error) {
    console.error('Update status error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

// @desc    Archive message
// @route   PATCH /api/contact/:id/archive
// @access  Admin
const archiveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return errorResponse(res, 404, 'Message not found');
    }

    successResponse(res, 200, 'Message archived successfully');
  } catch (error) {
    console.error('Archive error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Admin
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return errorResponse(res, 404, 'Message not found');
    }

    successResponse(res, 200, 'Message deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Admin
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, userEmail, userName, subject } = req.body;

    if (!replyMessage || !userEmail) {
      return errorResponse(res, 400, 'Reply message and user email are required');
    }

    try {
      await sendEmail({
        email: userEmail,
        subject: `Re: ${subject || 'Your Contact Message'}`,
        html: `
          <h1>Reply from LMS Team</h1>
          <p>Hi ${userName},</p>
          <p>Thank you for contacting us. Here's our response:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          <p>If you have any further questions, feel free to reach out.</p>
          <br>
          <p>Best regards,</p>
          <p>LMS Team</p>
        `,
      });

      await Contact.findByIdAndUpdate(id, { status: 'replied' });

      successResponse(res, 200, 'Reply sent successfully');
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      errorResponse(res, 500, 'Failed to send reply email');
    }
  } catch (error) {
    console.error('Reply error:', error);
    errorResponse(res, 500, 'Internal server error');
  }
};

module.exports = { 
  submitContactMessage, 
  getAllContactMessages,
  updateMessageStatus,
  archiveMessage,
  deleteMessage,
  replyToMessage
};