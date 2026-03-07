const mongoose = require('mongoose');

// Fail immediately if DB not connected instead of buffering for 10s
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`⚠️  MongoDB connection error: ${error.message}`);
      console.log('🔄 Retrying MongoDB connection in 5 seconds...');
      setTimeout(connect, 5000);
    }
  };
  await connect();
};

module.exports = connectDB;
