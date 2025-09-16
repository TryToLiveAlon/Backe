import dbConnect from "./_db.js";
import User from "../models/User.js";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  try {
    const { userId, firstName, lastName, username, photoUrl, referredBy } = req.query;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Check if already exists
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.json({ status: true, message: "User already exists", data: existing });
    }

    const newUser = new User({
      userId,
      firstName: firstName || null,
      lastName: lastName || null,
      username: username || null,
      photoUrl: photoUrl || null,
      referredBy: referredBy || null
    });

    await newUser.save();
    res.json({ status: true, message: "User registered", data: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
