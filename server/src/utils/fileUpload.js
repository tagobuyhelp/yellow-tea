import cloudinary from './cloudinaryConfig.js';
import { ApiError } from './apiError.js';

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {String} folder - Cloudinary folder
 * @returns {Object} - Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'yellow-tea') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto'
        });

        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        throw new ApiError(500, 'File upload failed');
    }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
    }
};