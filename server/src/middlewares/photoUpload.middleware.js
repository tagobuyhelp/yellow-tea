import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/apiError.js';

// Define the directory for saving photos
const photoDirectory = path.resolve('images/photos');

// Ensure the directory exists
if (!fs.existsSync(photoDirectory)) {
    fs.mkdirSync(photoDirectory, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, photoDirectory); // Save files in the photos directory
    },
    filename: (req, file, cb) => {
        // Generate a unique name based on timestamp and original file extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Set up multer middleware with the defined storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow only image files (jpg, jpeg, png, gif) and PDF files
        const allowedTypes = /jpeg|jpg|png|gif|pdf|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'Only image files and PDFs are allowed!'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10 MB
});

// Middleware to handle a single file upload under the field name 'photo'
export const uploadSinglePhoto = upload.single('photo');

// Middleware to handle multiple file uploads under the field name 'photos'
export const uploadMultiplePhotos = upload.array('images', 10); // Allow up to 10 images for products

// Middleware to handle multiple fields with different file types
export const uploadMixedFiles = upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'documents.identityDocument', maxCount: 1 },
    { name: 'documents.transcript', maxCount: 1 },
    { name: 'documents.workExperience', maxCount: 1 },
    { name: 'documents.languageTests', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'campusPhotos', maxCount: 5 },
    { name: 'imageUrl', maxCount: 4 },
]);

// Function to construct a valid photo URL or relative path
export const getPhotoPath = (filename) => {
    return `/images/photos/${filename}`; // Adjust to your desired path handling logic
};

// Function to delete a photo
export const deletePhoto = async (filename) => {
    const filePath = path.join(photoDirectory, filename);
    try {
        await fs.promises.unlink(filePath);
        console.log(`Successfully deleted ${filename}`);
    } catch (error) {
        console.error(`Error deleting ${filename}:`, error);
        throw new ApiError(500, `Failed to delete ${filename}`);
    }
};

// Middleware to handle file upload errors
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File size limit exceeded (max: 10MB)'));
        }
        return next(new ApiError(400, err.message));
    } else if (err instanceof ApiError) {
        return next(err);
    }
    next(new ApiError(500, 'An unknown error occurred during file upload'));
};