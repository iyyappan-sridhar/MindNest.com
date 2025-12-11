require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Booking = require('./models/Booking');
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ============================================================
   1) GET BOOKED SLOTS – used in calendar
============================================================ */
app.get('/api/booked-slots/:date', async (req, res) => {
  try {
    const booked = await Booking.find({ date: req.params.date, paid: true })
                                .select("slot -_id");
    res.json({ slots: booked.map(b => b.slot) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   2) CONFIRM UPI PAYMENT & SAVE BOOKING
   This route is called AFTER user pays from UPI app.
============================================================ */
app.post('/api/confirm-upi', async (req, res) => {
  try {
    const { date, slot, name, mobile, email, amountINR, type, upi } = req.body;

    // Prevent double booking
    const alreadyBooked = await Booking.findOne({ date, slot, paid: true });
    
    if (alreadyBooked) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    // Create booking only after user confirms payment
    await Booking.create({
      date,
      slot,
      name,
      mobile,
      email,
      amount: amountINR,
      type,
      upi,
      paid: true,
      createdAt: new Date()
    });

    res.json({ success: true });

  } catch (err) {
    console.log("UPI Save Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   3) FRONTEND STATIC FILE SERVE
============================================================ */
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

/* ============================================================
   4) DATABASE + SERVER START
============================================================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🍃 MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
