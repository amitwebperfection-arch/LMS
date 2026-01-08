const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/email.service');
const { uploadImage, deleteMedia } = require('../config/cloudinary');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const token = generateToken(user._id);

    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    successResponse(res, 201, 'User registered successfully', {
      user,
      token,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, 'Your account has been blocked');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    user.password = undefined;

    successResponse(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    successResponse(res, 200, 'User fetched successfully', { user });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found with this email');
    }

    const { resetToken, resetTokenExpire } = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);
      successResponse(res, 200, 'Password reset email sent');
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return errorResponse(res, 500, 'Email could not be sent');
    }
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    successResponse(res, 200, 'Password reset successful');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const changePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new passwords are required' });
  }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};


// @desc    Update user profile (with avatar)
// @route   PUT /api/users/profile or /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, preferences, instructorProfile, adminProfile  } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    if (name) {
      
      user.name = name;
    }
    if (phone) {
      
      user.phone = phone;
    }
    if (bio) {
      user.bio = bio;
    }

    if (preferences) {
      
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    if (instructorProfile && user.role === 'instructor') {
      
      user.instructorProfile = {
        ...user.instructorProfile,
        ...instructorProfile,
      };
    }

    if (adminProfile && user.role === 'admin') {
      user.adminProfile = {
        ...user.adminProfile,
        ...adminProfile,
      };
    }
    if (req.file) {
      try {
        if (user.avatar?.publicId) {
          await deleteMedia(user.avatar.publicId, 'image');
        }
        const uploadResult = await uploadImage(req.file.path, 'lms/avatars');
        user.avatar = uploadResult;
      } catch (uploadError) {
        return errorResponse(res, 500, `Failed to upload avatar: ${uploadError.message}`);
      }
    }
    await user.save();
    successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  changePasswordController,
  updateProfile,
};