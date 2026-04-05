const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'testhub/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => `profile-${req.userId}-${Date.now()}`
    }
});
const jsonStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'testhub/exam-details',
        allowed_formats: ['json'],
        public_id: (req, file) => `exam-${req.params.examId || req.body.exam_id}-${Date.now()}`,
        resource_type: 'raw'  // Important for non-image files
    }
});
module.exports = { cloudinary, storage,jsonStorage };