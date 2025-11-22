const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// ✅ Get booked slots for a specific date
router.get("/booked-slots/:date", async (req, res) => {
  try {
    const date = req.params.date;

    const booked = await Booking.find({ date });

    const slots = booked.map(item => item.slot);

    res.json({ slots });
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
