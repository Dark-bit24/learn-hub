const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      isApproved: true
    });

    await admin.save();
    console.log('Admin user created: admin@example.com / password123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
