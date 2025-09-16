import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId } = req.query;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ streak: user.streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
