const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    image: { type: String },
    BlogTitle: {
      type: "string",
    },
    BlogDate: {
      type: "string",
    },
    BlogDescription: {
      type: "string",
    },
    BlogVisibility: {
      type: "string",
    },
  },
  { timestamps: true }
);

const BlogModel = mongoose.model("BlogDB", BlogSchema);
module.exports = BlogModel;
