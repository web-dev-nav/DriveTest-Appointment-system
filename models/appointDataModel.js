// models/Appointment.js

const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    value: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isbooked: { type: Boolean, default: true },
    bookby: { type: String, default: ""  },
    TestType: { type: String  },
    status: { type: String, default: "Ready"  },
    comment: { type: String, default: ""  },
});

const appointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: [timeSlotSchema], // Use the timeSlotSchema for each time slot
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;