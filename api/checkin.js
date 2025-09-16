// api/checkin.js
import { connectDB } from "./_db.js";
import User from "./models/User.js";

function methodGuard(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Use GET." });
    return false;
  }
  return true;
}

function isSameUTCDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isYesterdayUTC(a, b) {
  // is a exactly one day before b
  const diff = (b.setUTCHours(0, 0, 0, 0) - a.setUTCHours(0, 0, 0, 0)) / 86400000;
  return diff === 1;
}

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;
  await connectDB();

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  // default bonus
  const bonus = Number(req.query.bonus ?? 50);

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();

    if (user.lastCheckin && isSameUTCDate(user.lastCheckin, new Date(now))) {
      return res.json({ ok: false, message: "Already checked in today", lastCheckin: user.lastCheckin });
    }

    // determine streak
    if (user.lastCheckin && isYesterdayUTC(new Date(user.lastCheckin), new Date(now))) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }

    user.balance += bonus;
    user.totalEarned += bonus;
    user.lastCheckin = now;
    // increment tasks counters a bit for checkin
    user.todayTasks += 1;
    user.lifetimeTasks += 1;
    user.updatedAt = now;

    await user.save();

    return res.json({
      ok: true,
      message: "Checkin successful",
      bonus,
      newBalance: user.balance,
      streak: user.streak,
      lastCheckin: user.lastCheckin
    });
  } catch (err) {
    console.error("checkin error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
