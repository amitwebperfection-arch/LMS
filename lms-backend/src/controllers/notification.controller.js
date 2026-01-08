const Notification = require('../models/Notification.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { PAGINATION } = require('../utils/constants');

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, link, metadata } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });

    successResponse(res, 201, 'Notification created successfully', {
      notification,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      isRead,
      type,
    } = req.query;

    const query = { user: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    paginatedResponse(
      res,
      200,
      'Notifications fetched successfully',
      notifications,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        unreadCount,
      }
    );
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    
    if (notification.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    successResponse(res, 200, 'Notification fetched successfully', {
      notification,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

  
    if (notification.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    successResponse(res, 200, 'Notification marked as read', {
      notification,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

  
    if (notification.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    await notification.deleteOne();

    successResponse(res, 200, 'Notification deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    successResponse(res, 200, 'All notifications deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    successResponse(res, 200, 'Unread count fetched successfully', {
      count,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const createNotificationHelper = async (userId, type, title, message, link = null, metadata = {}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  createNotificationHelper,
};