require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Create schema and model
const paymentSchema = new mongoose.Schema({
  amount: Number,
  pin: String,        // 👈 Added this line
  success: Boolean,
  date: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

// Payment endpoint
app.post("/pay", async (req, res) => {
  const { amount, pin } = req.body;

  if (!amount || !pin) {
    return res.json({ success: false, message: "Please fill all fields." });
  }

  const success = pin === "0157";
  const message = success
    ? `Payment of ₹${amount} successful!`
    : "Invalid PIN. Payment failed.";

  // Save transaction in DB (include pin)
  const payment = new Payment({ amount, pin, success });
  await payment.save();

  return res.json({ success, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
