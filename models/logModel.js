const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  data_hora: { type: Date, default: Date.now, required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Log = mongoose.model('log', logSchema);

module.exports = Log;
