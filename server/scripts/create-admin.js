const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceflow');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@freelanceflow.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@freelanceflow.com');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    const adminUser = new User({
      name: 'Platform Administrator',
      email: 'admin@freelanceflow.com',
      password: hashedPassword,
      userType: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@freelanceflow.com');
    console.log('Password: admin123456');
    console.log('User Type: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
