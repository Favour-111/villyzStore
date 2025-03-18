// upload.js
const multer = require("multer");
const { storage1, storage2, storage3 } = require("./cloudinary"); // Correctly import the Cloudinary storage configuration

// Initialize Multer with Cloudinary storage
const upload1 = multer({ storage: storage1 });
const upload2 = multer({ storage: storage2 });
const upload3 = multer({ storage: storage3 });

module.exports = { upload1, upload2, upload3 };
