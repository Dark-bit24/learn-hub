// ============================================
// MONGODB DATABASE CONNECTION
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed admin account if not existing or ensure credentials
    try {
      const User = require('../models/User');
      const bcrypt = require('bcryptjs');
      const adminEmail = 'admin@gmail.com';
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password@123', salt);
        await User.create({
          username: 'Institutional Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isApproved: true
        });
        console.log(`👑 Admin account seeded: ${adminEmail} (credentials: password@123 / admin123)`);
      } else if (existingAdmin.role !== 'admin' || !existingAdmin.isApproved) {
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        await existingAdmin.save();
      }
    } catch (seedErr) {
      console.warn('Admin seed warning:', seedErr.message);
    }
  } catch (error) {
    // If connection fails, show error and stop server
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
