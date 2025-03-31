const mongoose = require("mongoose");

const UserOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: "string",
  },
  id: {
    type: "string",
  },
  email: {
    type: "string",
  },
  date: {
    type: Date,
    default: new Date(),
  },
  OrderPrice: {
    type: Number,
  },
  DeliveryFee: {
    type: Number,
  },
  PaymentStatus: {
    type: "string",
    default: "Paid",
  },
  paymentReference: {
    type: "string",
  },
  PhoneNumber: {
    type: "string",
  },

  orderStatus: {
    type: "string",
    default: "Processing",
  },
  Orders: {
    type: Array,
  },
  street: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const UserOrderModel = mongoose.model("UserOrder", UserOrderSchema);
module.exports = UserOrderModel;
