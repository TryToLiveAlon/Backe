// api/register.js
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

  const { userId, firstName, lastName, username, photoUrl, referrerId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    let user = await User.findOne({ userId });
    if (user) {
      return res.json({ ok: true, message: "User already exists", user });
    }

    const newUser = new User({
      userId,
      firstName,
      lastName,
      username,
      photoUrl
    });

    // handle referrer if provided
    if (referrerId) {
      const ref = await User.findOne({ userId: referrerId });
      if (ref) {
        ref.referredUsers.push({
          userId,
          firstName,
          lastName,
          username,
          joinedAt: new Date()
        });
        await ref.save();
      }
    }

    await newUser.save();
    return res.json({ ok: true, message: "User registered", user: newUser });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
