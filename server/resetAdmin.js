import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learning-platform');
    
    const email = 'admin@example.com';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password@123', salt);
    
    const user = await User.findOneAndUpdate(
      { email },
      { 
        username: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        isApproved: true 
      },
      { upsert: true, new: true }
    );
    
    console.log('Admin account reset successfully:');
    console.log('Email:', user.email);
    console.log('Password: password@123');
    console.log('Role:', user.role);
    console.log('isApproved:', user.isApproved);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
