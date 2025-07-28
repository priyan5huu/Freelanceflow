const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const listAdminCredentials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceflow');
    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ userType: 'admin' });
    
    console.log('\n🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('==========================');
    
    for (let admin of adminUsers) {
      // Test multiple possible passwords
      const passwords = ['admin123456', 'password123', 'demo123456'];
      let validPassword = null;
      
      for (let pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, admin.password);
        if (isValid) {
          validPassword = pwd;
          break;
        }
      }
      
      console.log(`\n📧 Email: ${admin.email}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`🔐 Password: ${validPassword || 'UNKNOWN'}`);
      console.log(`✅ Active: ${admin.isActive}`);
      
      if (!validPassword) {
        // Set a known password
        console.log(`🔧 Setting password to 'admin123456'...`);
        const newHashedPassword = await bcrypt.hash('admin123456', 12);
        await User.findByIdAndUpdate(admin._id, { password: newHashedPassword });
        console.log(`✅ Password updated!`);
      }
    }

    console.log('\n🎯 RECOMMENDED LOGIN:');
    console.log('Email: admin@freelanceflow.com');
    console.log('Password: admin123456');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listAdminCredentials();
