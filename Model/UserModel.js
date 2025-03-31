const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\d{10,15}$/, "Invalid phone number"],
  },
  address: {
    street: { type: String },
    state: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  CartData: {
    type: Object,
    default: {},
  },
  Wishlist: {
    type: Object,
    default: {},
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserOrder" }],
  date: {
    type: Date,
    default: Date.now,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
});

// Model
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
