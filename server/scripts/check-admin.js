const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceflow');
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ userType: 'admin' });
    
    console.log('\n=== ADMIN USERS IN DATABASE ===');
    adminUsers.forEach(admin => {
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Active: ${admin.isActive}`);
      console.log(`Created: ${admin.createdAt}`);
      console.log('---');
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in database!');
      
      // Create a fresh admin user
      console.log('\n🔧 Creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);

      const adminUser = new User({
        name: 'Platform Administrator',
        email: 'admin@freelanceflow.com',
        password: hashedPassword,
        userType: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ New admin user created!');
      console.log('Email: admin@freelanceflow.com');
      console.log('Password: admin123456');
    } else {
      // Test password for the first admin user
      const testAdmin = adminUsers[0];
      const isPasswordValid = await bcrypt.compare('admin123456', testAdmin.password);
      console.log(`\n🔍 Testing password for ${testAdmin.email}:`);
      console.log(`Password 'admin123456' is ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isPasswordValid) {
        console.log('\n🔧 Updating password for admin user...');
        const newHashedPassword = await bcrypt.hash('admin123456', 12);
        await User.findByIdAndUpdate(testAdmin._id, { password: newHashedPassword });
        console.log('✅ Password updated successfully!');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdminUsers();
