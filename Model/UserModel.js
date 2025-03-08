const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  FirstName: {
    type: String, // ✅ Corrected data type
    required: true,
  },
  LastName: {
    type: String, // ✅ Corrected data type
    required: true,
  },
  email: {
    type: String, // ✅ Corrected data type
    required: true,
    unique: true,
    lowercase: true, // ✅ Ensures email is stored in lowercase
    trim: true,
  },
  password: {
    type: String, // ✅ Corrected data type
    required: true,
    minlength: 6, // ✅ Enforces minimum password length
  },
  phoneNumber: {
    type: String, // ✅ Corrected data type
    required: true,
    match: [/^\d{10,15}$/, "Invalid phone number"], // ✅ Enforces phone number validation
  },
  CartData: {
    type: Object, // ✅ Corrected data type
    default: {},
  },
  Wishlist: {
    type: Object, // ✅ Corrected data type
    default: {},
  },
  date: {
    type: Date, // ✅ Corrected data type
    default: Date.now, // ✅ Corrected function reference
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
});

// Model
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
