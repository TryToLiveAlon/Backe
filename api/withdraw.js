// api/withdraw.js
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

  const { userId, amount, method, address } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  if (!amount) return res.status(400).json({ error: "amount is required" });
  if (!method) return res.status(400).json({ error: "method is required" });
  if (!address) return res.status(400).json({ error: "address is required" });

  const amt = Number(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amt) {
      return res.status(400).json({ ok: false, message: "Insufficient balance" });
    }

    // Deduct balance immediately and add withdrawal record (pending)
    user.balance -= amt;
    user.withdrawals.push({
      amount: amt,
      method,
      address,
      status: "pending",
      createdAt: new Date()
    });
    user.updatedAt = new Date();

    await user.save();

    return res.json({
      ok: true,
      message: "Withdrawal requested",
      withdrawal: user.withdrawals[user.withdrawals.length - 1],
      newBalance: user.balance
    });
  } catch (err) {
    console.error("withdraw error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
