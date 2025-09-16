import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, ...updates } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: { ...updates, updatedAt: Date.now() } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
