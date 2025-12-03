
  const cards = document.querySelectorAll('.service-card');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 })
  cards.forEach(card => observer.observe(card));
const counters = document.querySelectorAll('.count');
const speed = 50;

counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / speed;

    if(count < target){
      counter.innerText = Math.ceil(count + increment);
      setTimeout(updateCount, 30);
    } else {
      counter.innerText = target + "+";
    }
  };

  updateCount();
});



/* ========== CONFIG ========== */
/* change slots here - multiple per day */
const SLOTS = ["09:00 AM","10:00 AM","11:30 AM","02:00 PM","03:30 PM","05:00 PM"];

/* booking storage key */
const STORAGE_KEY = 'bookings_demo_v1'; // localStorage key

/* helper: get bookings object from localStorage */
function readBookings(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return {};
  try{ return JSON.parse(raw)||{} }catch(e){ return {}; }
}
function saveBookings(obj){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

/* ========== Calendar render ========== */
let today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth(); // 0-index
let selectedDate = null;
let selectedSlot = null;

const daysGrid = document.getElementById('daysGrid');
const monthTitle = document.getElementById('monthTitle');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const slotsList = document.getElementById('slotsList');
const selectedDisplay = document.getElementById('selectedDisplay');
const selectedDayTitle = document.getElementById('selectedDayTitle');

function startOfMonth(year,m){ return new Date(year,m,1); }
function daysInMonth(year,m){ return new Date(year,m+1,0).getDate(); }

function renderCalendar(){
  daysGrid.innerHTML='';
  monthTitle.textContent = new Intl.DateTimeFormat('en',{ month:'long', year:'numeric'}).format(new Date(viewYear,viewMonth,1));

  const firstDay = startOfMonth(viewYear,viewMonth);
  const startWeekday = firstDay.getDay(); // 0..6
  const totalDays = daysInMonth(viewYear,viewMonth);

  // previous month's tail (optional) - show blank boxes
  for(let i=0;i<startWeekday;i++){
    const d = document.createElement('div'); d.className='day other'; d.innerHTML=''; daysGrid.appendChild(d);
  }

  // days
  for(let date=1; date<=totalDays; date++){
    const dt = new Date(viewYear, viewMonth, date);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    // disable past dates (optional)
    const todayOnly = new Date(); todayOnly.setHours(0,0,0,0);
    if(dt < todayOnly){
      dayEl.classList.add('disabled');
      dayEl.textContent = date;
      daysGrid.appendChild(dayEl);
      continue;
    }

    dayEl.textContent = date;

    // show active if matches selectedDate
    const iso = dt.toISOString().slice(0,10);
    if(selectedDate === iso) dayEl.classList.add('active');

    dayEl.addEventListener('click', ()=>{
      if(dayEl.classList.contains('disabled')) return;
      selectedDate = dt.toISOString().slice(0,10);
      renderCalendar();
      renderSlotsForDate(selectedDate);
      scrollToSlots();
    });

    daysGrid.appendChild(dayEl);
  }
}

/* Render slots for chosen date; disable booked ones */
function renderSlotsForDate(isoDate){
  slotsList.innerHTML='';
  selectedSlot = null;
  selectedDisplay.textContent = 'None';
  selectedDayTitle.textContent = `Slots for ${isoDate}`;
  const bookings = readBookings();
  const bookedForDate = bookings[isoDate] || []; // array of booked slot strings

  SLOTS.forEach(slot=>{
    const b = document.createElement('button');
    b.className = 'slot';
    b.textContent = slot;
    if(bookedForDate.includes(slot)){
      b.classList.add('disabled');
      b.disabled = true;
      b.title = 'Booked';
    } else {
      b.addEventListener('click', ()=>{
        // unselect existing
        document.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        selectedSlot = slot;
        selectedDisplay.textContent = isoToReadable(selectedDate) + ' • ' + selectedSlot;
        document.getElementById('toInfo').disabled = false;
      });
    }
    slotsList.appendChild(b);
  });
}

/* helpers */
function isoToReadable(iso){
  const d = new Date(iso);
  return d.toDateString();
}
function scrollToSlots(){
  document.getElementById('slotArea').scrollIntoView({behavior:'smooth', block:'center'});
}

/* nav */
prevMonthBtn.addEventListener('click', ()=>{
  viewMonth--;
  if(viewMonth<0){ viewMonth=11; viewYear--; }
  renderCalendar();
});
nextMonthBtn.addEventListener('click', ()=>{
  viewMonth++;
  if(viewMonth>11){ viewMonth=0; viewYear++; }
  renderCalendar();
});

/* initialise */
renderCalendar();

/* CLEAR selection */
document.getElementById('clearSelection').addEventListener('click', ()=>{
  selectedDate = null; selectedSlot = null;
  document.getElementById('toInfo').disabled = true;
  selectedDisplay.textContent = 'None';
  renderCalendar();
  slotsList.innerHTML='';
  selectedDayTitle.textContent = 'Select a date to view slots';
});

/* STEP navigation logic */
const stepEls = document.querySelectorAll('.step');
function setActiveStep(n){
  stepEls.forEach((s,i)=> s.classList.toggle('active', i===n-1));
  // show/hide panels
  document.getElementById('panel1').style.display = (n===1 ? 'block' : 'none');
  document.getElementById('panel2').style.display = (n===2 ? 'block' : 'none');
  document.getElementById('panel3').style.display = (n===3 ? 'block' : 'none');
  document.getElementById('panel4').style.display = (n===4 ? 'block' : 'none');
}

/* buttons */
document.getElementById('toInfo').addEventListener('click', ()=>{
  if(!selectedDate || !selectedSlot) return alert('Select date and slot first');
  setActiveStep(2);
});
document.getElementById('backToStep1').addEventListener('click', ()=> setActiveStep(1));
document.getElementById('toPayment').addEventListener('click', ()=>{
  // simple validation
  const name = document.getElementById('pname').value.trim();
  const mobile = document.getElementById('pmobile').value.trim();
  if(!name) return alert('Enter name');
  if(!mobile) return alert('Enter mobile');
  setActiveStep(3);
});
document.getElementById('backToStep2').addEventListener('click', ()=> setActiveStep(2));

/* Simulated payment & final booking */
document.getElementById('payNow').addEventListener('click', ()=>{
  // simulate payment then save booking
  // collect patient info
  const payload = {
    date: selectedDate,
    slot: selectedSlot,
    name: document.getElementById('pname').value.trim(),
    age: document.getElementById('page').value.trim(),
    type: document.getElementById('ptype').value,
    mobile: document.getElementById('pmobile').value.trim(),
    email: document.getElementById('pemail').value.trim(),
    paid: true,
    createdAt: new Date().toISOString()
  };

  // Save booking to localStorage
  const bookings = readBookings();
  bookings[payload.date] = bookings[payload.date] || [];
  bookings[payload.date].push(payload.slot);
  saveBookings(bookings);

  // generate ID
  const bid = 'BK' + Date.now().toString().slice(-6);
  document.getElementById('bookingId').textContent = bid;
  document.getElementById('confirmSummary').innerHTML = `
    <div><strong>${payload.name}</strong></div>
    <div>${isoToReadable(payload.date)} • ${payload.slot}</div>
    <div>Contact: ${payload.mobile}</div>
  `;

  setActiveStep(4);
  // after booking, re-render calendar to show disabled slot
  renderCalendar();
  renderSlotsForDate(selectedDate);
});

/* finish/done */
document.getElementById('finishBtn').addEventListener('click', ()=>{
  // clear selections (optional)
  selectedDate = null; selectedSlot = null;
  document.getElementById('pname').value=''; document.getElementById('page').value=''; document.getElementById('pmobile').value=''; document.getElementById('pemail').value='';
  document.getElementById('toInfo').disabled = true;
  setActiveStep(1);
  renderCalendar();
});

/* when page loads, if date selected earlier kept, disable next button */
document.getElementById('toInfo').disabled = true;

/* click day if previously selected (no) */


/* Payment Js */


const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET"
});

app.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // amount in paise
    currency: "INR",
    receipt: "order_rcptid_11"
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});


document.getElementById("payButton").onclick = function () {
  var options = {
    "key": "YOUR_KEY_ID",
    "amount": "50000", // in paise → ₹500
    "currency": "INR",
    "name": "Medical Counseling",
    "description": "Appointment Fees",
    "handler": function (response){
        alert("Payment Successful: " + response.razorpay_payment_id);
        // ✅ Here store booking in database
    }
  };
  var rzp = new Razorpay(options);
  rzp.open();
}



// header and footer loaded


 fetch("header.html").then(res => res.text()).then(data => {
      document.getElementById("header").innerHTML = data;
    });

    fetch("footer.html").then(res => res.text()).then(data => {
      document.getElementById("footer").innerHTML = data;
    });


    
fetch("chatbot.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("chatbotContainer").innerHTML = data;
  });