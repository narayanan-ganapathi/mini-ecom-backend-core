import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUser = process.env.MONGO_INITDB_ROOT_USERNAME || "admin";
    const mongoPass = process.env.MONGO_INITDB_ROOT_PASSWORD || "secret";
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydb";
    await mongoose.connect(mongoUri, {
      user: mongoUser,
      pass: mongoPass,
      authSource: "admin"
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
// Mongo connection setup
