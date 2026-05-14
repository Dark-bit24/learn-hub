// ============================================
// MONGODB DATABASE CONNECTION
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, show error and stop server
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
