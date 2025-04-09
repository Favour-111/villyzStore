const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  states: {
    type: Map,
    of: Number, // state name as key, price as value
    default: {},
  },
});

module.exports = mongoose.model("Location", LocationSchema);
