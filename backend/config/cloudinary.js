const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dietarysense/recipes",
    format: async (req, file) => {
      // Determine format based on file mimetype
      if (file.mimetype === "image/jpeg") return "jpg";
      if (file.mimetype === "image/png") return "png";
      if (file.mimetype === "image/webp") return "webp";
      return "jpg"; // default format
    },
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto" },
      { format: "auto" },
    ],
    public_id: (req, file) => {
      // Generate unique filename
      return `recipe_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    },
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Utility functions for Cloudinary
const cloudinaryUtils = {
  // Upload image
  uploadImage: async (filePath, options = {}) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "dietarysense/recipes",
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`Cloudinary upload error: ${error.message}`);
    }
  },

  // Delete image
  deleteImage: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Cloudinary delete error: ${error.message}`);
    }
  },

  // Generate image URL with transformations
  generateImageUrl: (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  },

  // Extract public ID from Cloudinary URL
  getPublicIdFromUrl: (url) => {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  },
};

module.exports = {
  cloudinary,
  upload,
  cloudinaryUtils,
};
