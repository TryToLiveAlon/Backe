import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const lastCheckin = user.lastCheckin || null;
    const isNewDay = !lastCheckin || now.toDateString() !== lastCheckin.toDateString();

    if (!isNewDay) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    user.lastCheckin = now;
    user.streak += 1;
    user.balance += 10; // 🎁 reward
    user.totalEarned += 10;
    await user.save();

    res.status(200).json({ message: "Check-in successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
