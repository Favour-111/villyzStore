const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    image: { type: String },
    name: {
      type: "string",
    },
    visibility: {
      type: "string",
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("CategoryDB", CategorySchema);
module.exports = CategoryModel;
