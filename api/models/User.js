// api/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  username: String,
  photoUrl: String,
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCheckin: Date,
  todayTasks: { type: Number, default: 0 },
  hourlyTasks: { type: Number, default: 0 },
  lifetimeTasks: { type: Number, default: 0 },
  dailyTaskLimit: { type: Number, default: 100 },
  hourlyTaskLimit: { type: Number, default: 10 },
  referredUsers: [
    {
      userId: String,
      firstName: String,
      lastName: String,
      username: String,
      joinedAt: Date
    }
  ],
  referralEarnings: { type: Number, default: 0 },
  withdrawals: [
    {
      amount: Number,
      method: String,
      address: String,
      status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
      createdAt: Date
    }
  ],
  currency: { type: String, default: "USDT" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Avoid model overwrite in serverless envs
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
