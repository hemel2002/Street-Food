const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configure Multer to use Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto'; // Default to auto-detect based on file content

    // Check file type and set resource type accordingly
    if (file.mimetype.startsWith('video')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('image')) {
      resourceType = 'image';
    }

    return {
      folder: 'food',
      resource_type: resourceType,
      allowed_formats: ['jpeg', 'jpg', 'png', 'mp4', 'mov', 'wmv'],
    };
  },
});

module.exports = { cloudinary, storage };
