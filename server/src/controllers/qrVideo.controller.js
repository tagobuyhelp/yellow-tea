import mongoose from 'mongoose';
import QRVideo from '../models/qrVideo.model.js';
import Product from '../models/product.model.js';
import cloudinary from '../utils/cloudinaryConfig.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

/**
 * @desc    Create new QR video
 * @route   POST /api/v1/qr-videos
 * @access  Private/Admin
 */
export const createQRVideo = async (req, res, next) => {
    try {
        const { 
            product_id, 
            video_url, 
            steps, 
            timer_seconds, 
            title, 
            description, 
            thumbnail_url 
        } = req.body;

        // Validate product exists
        const productExists = await Product.findById(product_id);
        if (!productExists) {
            return next(new ApiError(404, 'Product not found'));
        }

        // Check if QR video already exists for this product
        const existingQRVideo = await QRVideo.findOne({ product_id });
        if (existingQRVideo) {
            return next(new ApiError(400, 'QR video already exists for this product'));
        }

        // Generate QR code URL (placeholder - will be updated with actual QR code)
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://yellowtea.com' 
            : 'http://localhost:5000';
        
        const qrCodeUrl = `${baseUrl}/brew/${productExists.slug}`;

        // Create new QR video
        const qrVideo = await QRVideo.create({
            product_id,
            video_url,
            qr_code: qrCodeUrl, // Placeholder, will be updated with actual QR code image
            steps,
            timer_seconds,
            title,
            description,
            thumbnail_url
        });

        // Generate actual QR code and update the record
        await qrVideo.generateQRCodeURL(baseUrl);

        res.status(201).json(
            new ApiResponse(201, qrVideo, 'QR video created successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all QR videos
 * @route   GET /api/v1/qr-videos
 * @access  Private/Admin
 */
export const getAllQRVideos = async (req, res, next) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        
        // Fields to exclude from filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `${match}`);
        
        let query = QRVideo.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const qrVideos = await query;
        
        // Get total count for pagination
        const total = await QRVideo.countDocuments(JSON.parse(queryStr));

        res.status(200).json(
            new ApiResponse(200, {
                qrVideos,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }, 'QR videos retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get QR video by ID
 * @route   GET /api/v1/qr-videos/:id
 * @access  Private/Admin
 */
export const getQRVideoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const qrVideo = await QRVideo.findById(id);

        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found'));
        }

        res.status(200).json(
            new ApiResponse(200, qrVideo, 'QR video retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get QR video by product slug
 * @route   GET /api/v1/qr-videos/product/:slug
 * @access  Public
 */
export const getQRVideoByProductSlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const qrVideo = await QRVideo.getVideoByProductSlug(slug);

        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found for this product'));
        }

        res.status(200).json(
            new ApiResponse(200, qrVideo, 'QR video retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update QR video
 * @route   PUT /api/v1/qr-videos/:id
 * @access  Private/Admin
 */
export const updateQRVideo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If product_id is provided, validate product exists
        if (updateData.product_id) {
            const productExists = await Product.findById(updateData.product_id);
            if (!productExists) {
                return next(new ApiError(404, 'Product not found'));
            }

            // Check if QR video already exists for this product (except current one)
            const existingQRVideo = await QRVideo.findOne({ 
                product_id: updateData.product_id,
                _id: { $ne: id }
            });
            
            if (existingQRVideo) {
                return next(new ApiError(400, 'QR video already exists for this product'));
            }
        }

        const qrVideo = await QRVideo.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found'));
        }

        res.status(200).json(
            new ApiResponse(200, qrVideo, 'QR video updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete QR video
 * @route   DELETE /api/v1/qr-videos/:id
 * @access  Private/Admin
 */
export const deleteQRVideo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const qrVideo = await QRVideo.findById(id);

        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found'));
        }

        // Delete video and thumbnail from Cloudinary if they are hosted there
        if (qrVideo.video_url && qrVideo.video_url.includes('cloudinary')) {
            const videoPublicId = qrVideo.video_url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
        }

        if (qrVideo.thumbnail_url && qrVideo.thumbnail_url.includes('cloudinary')) {
            const thumbnailPublicId = qrVideo.thumbnail_url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(thumbnailPublicId);
        }

        if (qrVideo.qr_code && qrVideo.qr_code.includes('cloudinary')) {
            const qrCodePublicId = qrVideo.qr_code.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(qrCodePublicId);
        }

        await QRVideo.findByIdAndDelete(id);

        res.status(200).json(
            new ApiResponse(200, null, 'QR video deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload video to Cloudinary
 * @route   POST /api/v1/qr-videos/upload-video
 * @access  Private/Admin
 */
export const uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ApiError(400, 'Please upload a video file'));
        }

        const result = await uploadToCloudinary(req.file, 'yellow_tea/qr_videos');

        res.status(200).json(
            new ApiResponse(200, {
                video_url: result.secure_url,
                public_id: result.public_id
            }, 'Video uploaded successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload thumbnail to Cloudinary
 * @route   POST /api/v1/qr-videos/upload-thumbnail
 * @access  Private/Admin
 */
export const uploadThumbnail = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ApiError(400, 'Please upload a thumbnail image'));
        }

        const result = await uploadToCloudinary(req.file, 'yellow_tea/qr_thumbnails');

        res.status(200).json(
            new ApiResponse(200, {
                thumbnail_url: result.secure_url,
                public_id: result.public_id
            }, 'Thumbnail uploaded successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle QR video active status
 * @route   PATCH /api/v1/qr-videos/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleQRVideoStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        const qrVideo = await QRVideo.findById(id);

        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found'));
        }

        qrVideo.is_active = !qrVideo.is_active;
        await qrVideo.save();

        res.status(200).json(
            new ApiResponse(200, qrVideo, `QR video ${qrVideo.is_active ? 'activated' : 'deactivated'} successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get active QR videos
 * @route   GET /api/v1/qr-videos/active
 * @access  Public
 */
export const getActiveQRVideos = async (req, res, next) => {
    try {
        const activeVideos = await QRVideo.find({ is_active: true });

        res.status(200).json(
            new ApiResponse(200, activeVideos, 'Active QR videos retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Batch update QR videos
 * @route   POST /api/v1/qr-videos/batch
 * @access  Private/Admin
 */
export const batchUpdateQRVideos = async (req, res, next) => {
    try {
        const { videos } = req.body;
        
        if (!Array.isArray(videos) || videos.length === 0) {
            return next(new ApiError(400, 'Please provide an array of videos to update'));
        }
        
        const operations = videos.map(video => {
            return {
                updateOne: {
                    filter: { _id: video._id },
                    update: {
                        $set: {
                            video_url: video.video_url,
                            steps: video.steps,
                            timer_seconds: video.timer_seconds,
                            title: video.title,
                            description: video.description,
                            thumbnail_url: video.thumbnail_url,
                            is_active: video.is_active
                        }
                    }
                }
            };
        });
        
        const result = await QRVideo.bulkWrite(operations);
        
        res.status(200).json(
            new ApiResponse(200, result, 'QR videos batch updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate QR codes for all products without QR videos
 * @route   POST /api/v1/qr-videos/generate-missing
 * @access  Private/Admin
 */
export const generateMissingQRCodes = async (req, res, next) => {
    try {
        // Get all products
        const products = await Product.find({}, '_id name slug');
        
        // Get products that already have QR videos
        const existingQRVideos = await QRVideo.find({}, 'product_id');
        const existingProductIds = existingQRVideos.map(video => video.product_id.toString());
        
        // Filter products without QR videos
        const productsWithoutQR = products.filter(product => 
            !existingProductIds.includes(product._id.toString())
        );
        
        if (productsWithoutQR.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], 'All products already have QR videos')
            );
        }
        
        // Generate default QR videos for products without them
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://yellowtea.com' 
            : 'http://localhost:5000';
            
        const defaultVideoUrl = 'https://res.cloudinary.com/your-cloud-name/video/upload/v1/yellow_tea/default_brewing_video.mp4';
        const defaultThumbnailUrl = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/yellow_tea/default_thumbnail.jpg';
        
        const newQRVideos = await Promise.all(productsWithoutQR.map(async (product) => {
            const qrCodeUrl = `${baseUrl}/brew/${product.slug}`;
            
            const qrVideo = await QRVideo.create({
                product_id: product._id,
                video_url: defaultVideoUrl,
                qr_code: qrCodeUrl,
                steps: ['Add tea to cup', 'Pour hot water', 'Steep for 3 minutes', 'Enjoy!'],
                timer_seconds: 180,
                title: `How to brew ${product.name}`,
                description: `Learn how to perfectly brew ${product.name} for the best flavor experience.`,
                thumbnail_url: defaultThumbnailUrl,
                is_active: false // Set to inactive by default
            });
            
            // Generate actual QR code
            await qrVideo.generateQRCodeURL(baseUrl);
            
            return qrVideo;
        }));
        
        res.status(201).json(
            new ApiResponse(201, newQRVideos, `Generated ${newQRVideos.length} new QR videos`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get QR video statistics
 * @route   GET /api/v1/qr-videos/stats
 * @access  Private/Admin
 */
export const getQRVideoStats = async (req, res, next) => {
    try {
        const totalVideos = await QRVideo.countDocuments();
        const activeVideos = await QRVideo.countDocuments({ is_active: true });
        const inactiveVideos = totalVideos - activeVideos;
        
        // Get products without QR videos
        const totalProducts = await Product.countDocuments();
        const productsWithQR = await QRVideo.countDocuments();
        const productsWithoutQR = totalProducts - productsWithQR;
        
        // Get most recent videos
        const recentVideos = await QRVideo.find()
            .sort('-created_at')
            .limit(5)
            .populate('product_id', 'name slug');
            
        res.status(200).json(
            new ApiResponse(200, {
                totalVideos,
                activeVideos,
                inactiveVideos,
                coverage: {
                    totalProducts,
                    productsWithQR,
                    productsWithoutQR,
                    coveragePercentage: (productsWithQR / totalProducts * 100).toFixed(2)
                },
                recentVideos
            }, 'QR video statistics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Scan QR code and record analytics
 * @route   GET /api/v1/qr-videos/scan/:slug
 * @access  Public
 */
export const scanQRCode = async (req, res, next) => {
    try {
        const { slug } = req.params;
        
        // Find product by slug
        const product = await Product.findOne({ slug });
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        // Find QR video for product
        const qrVideo = await QRVideo.findOne({ product_id: product._id });
        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found for this product'));
        }
        
        // Record scan analytics (you could implement a separate model for this)
        // For now, we'll just return the QR video data
        
        res.status(200).json(
            new ApiResponse(200, {
                product: {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    images: product.images
                },
                qrVideo: {
                    _id: qrVideo._id,
                    video_url: qrVideo.video_url,
                    steps: qrVideo.steps,
                    timer_seconds: qrVideo.timer_seconds,
                    title: qrVideo.title,
                    description: qrVideo.description,
                    thumbnail_url: qrVideo.thumbnail_url
                }
            }, 'QR code scanned successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Regenerate QR code for a video
 * @route   POST /api/v1/qr-videos/:id/regenerate-qr
 * @access  Private/Admin
 */
export const regenerateQRCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const qrVideo = await QRVideo.findById(id);
        if (!qrVideo) {
            return next(new ApiError(404, 'QR video not found'));
        }
        
        // Get the product to access its slug
        const product = await Product.findById(qrVideo.product_id);
        if (!product) {
            return next(new ApiError(404, 'Associated product not found'));
        }
        
        // Generate new QR code
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://yellowtea.com' 
            : 'http://localhost:5000';
            
        await qrVideo.generateQRCodeURL(baseUrl);
        
        res.status(200).json(
            new ApiResponse(200, qrVideo, 'QR code regenerated successfully')
        );
    } catch (error) {
        next(error);
    }
};