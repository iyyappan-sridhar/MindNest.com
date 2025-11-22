const mongoose = require('mongoose');


const BookingSchema = new mongoose.Schema({
date: { type: String, required: true },
slot: { type: String, required: true },
name: { type: String },
age: { type: Number },
type: { type: String },
mobile: { type: String },
email: { type: String },
amount: { type: Number },
payment_id: { type: String },
order_id: { type: String },
signature: { type: String },
paid: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});


// prevent double booking on same date+slot
BookingSchema.index({ date: 1, slot: 1 }, { unique: true });


module.exports = mongoose.model('Booking', BookingSchema);