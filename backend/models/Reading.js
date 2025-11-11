const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  timestamp: { type: Date, default: Date.now },
  watts: { type: Number, required: true },
  voltage: { type: Number, required: false },
  current: { type: Number, required: false },
  energy:  { type: Number, required: false }
});

module.exports = mongoose.model('Reading', ReadingSchema);
