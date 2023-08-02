// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const facilities = {
  clubhouse: {
    rates: [
      { startTime: '10:00', endTime: '16:00', rate: 100 },
      { startTime: '16:00', endTime: '22:00', rate: 500 },
    ],
    bookings: [],
  },
  tennisCourt: {
    rates: [{ startTime: '00:00', endTime: '23:59', rate: 50 }],
    bookings: [],
  },
};

const isFacilityAvailable = (facility, date, startTime, endTime) => {
  const bookings = facilities[facility].bookings;
  for (const booking of bookings) {
    if (
      booking.date === date &&
      !(endTime <= booking.startTime || startTime >= booking.endTime)
    ) {
      return false;
    }
  }
  return true;
};

const calculateBookingCost = (facility, startTime, endTime) => {

  const timeStringToHours = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  };
  
  const bookingConfig = facilities[facility].rates;
  let cost = 0;
  for (const rate of bookingConfig) {
    if (startTime < rate.endTime && endTime > rate.startTime) {
      const overlapStart = Math.max(timeStringToHours(startTime), timeStringToHours(rate.startTime));
      const overlapEnd = Math.min(timeStringToHours(endTime), timeStringToHours(rate.endTime));
      const duration = (overlapEnd - overlapStart);
      cost += duration * rate.rate;
    }
  }
  return cost;
};

app.post('/book', (req, res) => {
  const { facility, date, startTime, endTime } = req.body;
  if (!isFacilityAvailable(facility, date, startTime, endTime)) {
    return res.status(400).json({ message: 'Booking Failed, Already Booked' });
  }

  const cost = calculateBookingCost(facility, startTime, endTime);
  facilities[facility].bookings.push({ date, startTime, endTime });

  return res.status(200).json({ message: 'Booking Successful', cost });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

