require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course.model');
const User = require('../src/models/User.model');
const Enrollment = require('../src/models/Enrollment.model');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

   
    await Course.updateMany(
      { isFree: { $exists: false } },
      { 
        $set: { 
          isFree: false,
          visibility: 'public',
          certificateEnabled: true,
          accessDuration: 'lifetime',
          lastUpdatedAt: new Date()
        }
      }
    );
    console.log('✅ Courses migrated');

    
    await User.updateMany(
      { preferences: { $exists: false } },
      {
        $set: {
          preferences: {
            emailNotifications: true,
            pushNotifications: true,
            courseUpdates: true,
            promotionalEmails: false,
            language: 'en',
            timezone: 'UTC',
          },
        },
      }
    );
    console.log('✅ Users migrated');

    
    await Enrollment.updateMany(
      { enrollmentSource: { $exists: false } },
      { $set: { enrollmentSource: 'web', lastAccessedAt: new Date() } }
    );
    console.log('✅ Enrollments migrated');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();