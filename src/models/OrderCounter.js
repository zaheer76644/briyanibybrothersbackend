const mongoose = require("mongoose");

const orderCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1000 },
});

module.exports = mongoose.model("OrderCounter", orderCounterSchema);
