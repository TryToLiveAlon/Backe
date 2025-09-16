import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  try {
    const { userId, ...updates } = req.query;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    updates.updatedAt = Date.now();

    const user = await User.findOneAndUpdate({ userId }, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ status: true, message: "User updated", data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
