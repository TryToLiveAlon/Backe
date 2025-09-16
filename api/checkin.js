import dbConnect from "./_db.js";
import User from "../models/User.js";

function isSameDay(d1, d2) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const lastCheckin = user.lastCheckin ? new Date(user.lastCheckin) : null;

    if (lastCheckin && isSameDay(lastCheckin, now)) {
      return res.json({ status: false, message: "Already checked in today" });
    }

    user.streak = lastCheckin ? user.streak + 1 : 1;
    user.balance += 10;
    user.totalEarned += 10;
    user.lastCheckin = now;
    await user.save();

    res.json({
      status: true,
      message: "Check-in successful",
      data: { streak: user.streak, balance: user.balance }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
