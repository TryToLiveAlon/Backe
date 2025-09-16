import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { userId, referredBy, ...rest } = req.body;

      if (!userId) return res.status(400).json({ error: "userId is required" });

      const existing = await User.findOne({ userId });
      if (existing) return res.status(400).json({ error: "User already exists" });

      const newUser = new User({
        userId,
        referredBy: referredBy || null,
        ...rest
      });

      await newUser.save();
      return res.status(201).json(newUser);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
