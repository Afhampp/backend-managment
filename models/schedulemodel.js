const mongoose = require('mongoose');

const timeSlotSchema = mongoose.Schema({
  file: {
    type: String,
  },
  time: {
    type: String,
    required: true,
  },
});

// Define default time slots for each day
const defaultTimeSlots = [
  { time: '9:00-11:00' },
  { time: '11:30-1:30' },
  { time: '2:30-4:00' },
  { time: '4:00-6:00' },
];

const scheduleschema = mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'classdb',
  },
  submittion: {
    type: [
      {
        day: String, // Store the day (Monday, Tuesday, etc.) as a String
        slots: [timeSlotSchema], // Array of time slots for each day
      },
    ],
    default: [
      { day: 'Monday', slots: defaultTimeSlots },
      { day: 'Tuesday', slots: defaultTimeSlots },
      { day: 'Wednesday', slots: defaultTimeSlots },
      { day: 'Thursday', slots: defaultTimeSlots },
      { day: 'Friday', slots: defaultTimeSlots },
    ], // Set the default time slots for all days
  },
});

module.exports = mongoose.model('scheduledb', scheduleschema);
