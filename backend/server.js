require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const Booking = require('./models/Booking');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connect
mongoose.connect("mongodb://127.0.0.1:27017/appointmentDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order API
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

// ✅ Payment Verification API
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

// ✅ Get Booked Slots (Used by frontend)
app.get('/api/booked-slots/:date', async (req, res) => {
  const booked = await Booking.find({ date: req.params.date, paid: true })
    .select('slot -_id');

  res.json({ slots: booked.map(s => s.slot) });
});

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));
