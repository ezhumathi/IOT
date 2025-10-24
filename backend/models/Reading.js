const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  timestamp: { type: Date, default: Date.now },
  watts: { type: Number, required: true } 
});

module.exports = mongoose.model('Reading', ReadingSchema);
