require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const Booking = require('./models/Booking');
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =========================
// 1) API ROUTES FIRST
// =========================

// Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amountINR, date, slot, name, mobile, email } = req.body;

    const existing = await Booking.findOne({ date, slot, paid: true });
    if (existing) return res.status(409).json({ error: 'Slot already booked' });

    const amount = Number(amountINR) * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    await new Booking({
      date, slot, name, mobile, email,
      amount: amountINR,
      paid: false,
      order_id: order.id
    }).save();

    res.json({ order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment verify
app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (sign !== razorpay_signature)
    return res.status(400).json({ error: "Invalid Signature" });

  const booking = await Booking.findOne({ order_id: razorpay_order_id });
  booking.paid = true;
  booking.payment_id = razorpay_payment_id;
  await booking.save();

  res.json({ success: true });
});

// Get booked slots
app.get('/api/booked-slots/:date', async (req, res) => {
  const booked = await Booking.find({ date: req.params.date })
    .select('slot -_id');

  res.json({ slots: booked.map(s => s.slot) });
});

// =========================
// 2) FRONTEND SERVE NEXT
// =========================

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// =========================
// 3) DB + SERVER START
// =========================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🍃 MongoDB Atlas Connected Successfully!"))
  .catch(err => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
