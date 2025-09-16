// api/update.js
import { connectDB } from "./_db.js";
import User from "./models/User.js";

function methodGuard(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Use GET." });
    return false;
  }
  return true;
}

function parseNumber(v) {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export default async function handler(req, res) {
  if (!methodGuard(req, res)) return;
  await connectDB();

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // fields to update (set directly)
    const updatable = ["firstName", "lastName", "username", "photoUrl", "currency"];
    updatable.forEach((k) => {
      if (req.query[k] !== undefined) user[k] = req.query[k];
    });

    // balanceDelta - number to add/subtract
    const balanceDelta = parseNumber(req.query.balanceDelta);
    if (balanceDelta !== undefined) {
      user.balance += balanceDelta;
      if (balanceDelta > 0) user.totalEarned += balanceDelta;
    }

    // optionally set exact balance with balanceSet
    const balanceSet = parseNumber(req.query.balanceSet);
    if (balanceSet !== undefined) {
      user.balance = balanceSet;
    }

    // adjust task counters if provided
    const incTodayTasks = parseNumber(req.query.incTodayTasks);
    if (incTodayTasks) user.todayTasks += incTodayTasks;

    const incHourlyTasks = parseNumber(req.query.incHourlyTasks);
    if (incHourlyTasks) user.hourlyTasks += incHourlyTasks;

    user.updatedAt = new Date();
    await user.save();

    return res.json({ ok: true, message: "User updated", user });
  } catch (err) {
    console.error("update error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
                                      }
        
