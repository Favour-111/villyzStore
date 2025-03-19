// cloudinaryConfig.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary using environment variables (or hardcoded if necessary)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "drn3lmktm", // Your Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY || "283212421525796", // Your Cloudinary API Key
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "FXvbNkHhS0VQ4r5XeV7SxsZFBfE", // Your Cloudinary API Secret
});

// Set up Multer Storage to upload directly to Cloudinary
const storage1 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // All uploaded files will be stored in this folder
    format: async (req, file) => file.mimetype.split("/")[1], // Use the original file name without extension
  },
});
const storage2 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "categories", // All uploaded files will be stored in this folder
    format: async (req, file) => file.mimetype.split("/")[1],
  },
});
const storage3 = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogs", // All uploaded files will be stored in this folder
    format: async (req, file) => file.mimetype.split("/")[1],
  },
});

module.exports = { cloudinary, storage1, storage2, storage3 };
