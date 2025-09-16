// api/ad-watched.js
import { connectDB } from "./_db.js";
import User from "./models/User.js";

function methodGuard(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Use GET." });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;
  await connectDB();

  const { userId, reward } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const rewardNum = Number(reward ?? 10); // default reward 10

  if (Number.isNaN(rewardNum) || rewardNum <= 0) {
    return res.status(400).json({ error: "Invalid reward amount" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // check hourly/daily limits
    if (user.hourlyTaskLimit && user.hourlyTasks >= user.hourlyTaskLimit) {
      return res.json({ ok: false, message: "Hourly tasks limit reached" });
    }
    if (user.dailyTaskLimit && user.todayTasks >= user.dailyTaskLimit) {
      return res.json({ ok: false, message: "Daily tasks limit reached" });
    }

    user.balance += rewardNum;
    user.totalEarned += rewardNum;
    user.hourlyTasks += 1;
    user.todayTasks += 1;
    user.lifetimeTasks += 1;
    user.updatedAt = new Date();

    await user.save();

    return res.json({
      ok: true,
      message: "Ad reward applied",
      reward: rewardNum,
      newBalance: user.balance,
      hourlyTasks: user.hourlyTasks,
      todayTasks: user.todayTasks
    });
  } catch (err) {
    console.error("ad-watched error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
