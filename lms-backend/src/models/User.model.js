const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    avatar: {
      url: {
        type: String,
        default: 'https://via.placeholder.com/150',
      },
      publicId: String,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    socialLoginProviders: {
      google: {
        id: String,
        email: String,
      },
      facebook: {
        id: String,
        email: String,
      },
      github: {
        id: String,
        email: String,
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
      promotionalEmails: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    instructorProfile: {
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalStudents: {
        type: Number,
        default: 0,
      },
      totalCourses: {
        type: Number,
        default: 0,
      },
      expertise: [String],
      headline: String,
      website: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);