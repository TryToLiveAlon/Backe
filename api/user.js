// api/user.js
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

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    const user = await User.findOne({ userId }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ ok: true, user });
  } catch (err) {
    console.error("user error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
