const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  color: {
    type: String,
    default: '#3788d8',
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);