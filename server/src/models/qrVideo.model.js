import mongoose from 'mongoose';
import QRCode from 'qrcode';
import cloudinary from '../utils/cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid';
import Product from './product.model.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ApiError } from '../utils/apiError.js';

const qrVideoSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
        unique: true
    },
    video_url: {
        type: String,
        required: [true, 'Video URL is required']
    },
    qr_code: {
        type: String,
        required: [true, 'QR code is required']
    },
    steps: {
        type: [String],
        required: [true, 'Brewing steps are required']
    },
    timer_seconds: {
        type: Number,
        required: [true, 'Timer duration is required'],
        min: [1, 'Timer must be at least 1 second']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    thumbnail_url: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    scan_count: {
        type: Number,
        default: 0
    },
    last_scanned: {
        type: Date
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Method to generate QR code and upload to Cloudinary
qrVideoSchema.methods.generateQRCodeURL = async function(baseUrl) {
    try {
        // Get product slug
        const product = await Product.findById(this.product_id);
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        
        // Create QR code URL
        const qrUrl = `${baseUrl}/brew/${product.slug}`;
        
        // Create a temporary file path for the QR code
        const tempDir = os.tmpdir();
        const qrFilePath = path.join(tempDir, `qr-${uuidv4()}.png`);
        
        // Generate QR code with styling options
        await QRCode.toFile(qrFilePath, qrUrl, {
            color: {
                dark: '#000000',  // Black dots
                light: '#FFFFFF'  // White background
            },
            width: 500,
            margin: 1,
            errorCorrectionLevel: 'H' // High error correction for better scanning
        });
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(qrFilePath, {
                folder: 'yellow_tea/qr_codes',
                public_id: `qr-${product.slug}`,
                overwrite: true
            }, (error, result) => {
                // Delete the temporary file
                fs.unlink(qrFilePath, (err) => {
                    if (err) console.error('Error deleting temporary QR file:', err);
                });
                
                if (error) reject(error);
                else resolve(result);
            });
        });
        
        // Update the QR code URL in the document
        this.qr_code = result.secure_url;
        await this.save();
        
        return this.qr_code;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Static method to get QR video by product slug
qrVideoSchema.statics.getVideoByProductSlug = async function(slug) {
    try {
        // Find product by slug
        const product = await Product.findOne({ slug });
        if (!product) {
            return null;
        }
        
        // Find QR video for this product
        const qrVideo = await this.findOne({ product_id: product._id });
        
        // If found and active, increment scan count and update last scanned time
        if (qrVideo && qrVideo.is_active) {
            qrVideo.scan_count += 1;
            qrVideo.last_scanned = new Date();
            await qrVideo.save();
        }
        
        return qrVideo;
    } catch (error) {
        console.error('Error getting QR video by product slug:', error);
        throw error;
    }
};

const QRVideo = mongoose.model('QRVideo', qrVideoSchema);

export default QRVideo;