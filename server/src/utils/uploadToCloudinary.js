import cloudinary from './cloudinaryConfig.js';
import { ApiError } from './apiError.js';

const uploadToCloudinary = async (file, folder) => {
    try {
        if (!file) throw new ApiError(400, "No file provided");

        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: "auto"
        });

        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        throw new ApiError(500, "Error uploading file to Cloudinary", [error.message]);
    }
};

export default uploadToCloudinary;