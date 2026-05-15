const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const admin = await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      {
        username: 'Admin User',
        password: 'password@123',
        role: 'admin',
        isApproved: true
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('Admin user updated/created: admin@gmail.com / password@123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
