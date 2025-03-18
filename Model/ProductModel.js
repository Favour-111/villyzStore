const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    image: { type: String },
    productName: {
      type: "string",
    },
    Rating: {
      type: "number",
    },
    availability: {
      type: "string",
    },
    oldPrice: {
      type: "string",
    },
    newPrice: {
      type: "string",
    },
    categories: {
      type: "string",
    },
    productDescription: {
      type: "string",
    },
    deals: {
      type: "string",
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("ProductDB", ProductSchema);
module.exports = ProductModel;
