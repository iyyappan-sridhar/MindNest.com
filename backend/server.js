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

/* ------------------ GET BOOKED SLOTS ------------------ */
app.get('/api/booked-slots/:date', async (req, res) => {
  const booked = await Booking.find({ date: req.params.date }).select("slot -_id");
  res.json({ slots: booked.map(b => b.slot) });
});

/* ------------------ UPI CONFIRM BOOKING ------------------ */
app.post('/api/confirm-upi', async (req,res)=>{
  try{
    const { date, slot, name, mobile, email, amountINR, type, upi } = req.body;

    let booking = await Booking.findOne({ date, slot });

    if(!booking){
      booking = await Booking.create({
        date, slot, name, mobile, email,
        amount: amountINR,
        paid: true,
        type,
        upi
      });
    } else {
      booking.name=name;
      booking.mobile=mobile;
      booking.email=email;
      booking.amount=amountINR;
      booking.type=type;
      booking.upi=upi;
      booking.paid=true;
      await booking.save();
    }

    res.json({success:true});
  }catch(err){
    console.log(err);
    res.status(500).json({error:err.message});
  }
});

/* ------------------ FRONTEND SERVE ------------------ */
app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

/* ------------------ DATABASE & SERVER ------------------ */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Server Running on ${PORT}`));
